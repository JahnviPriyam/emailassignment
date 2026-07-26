import { prisma } from '../db/prisma';
import { emailQueue } from '../queue/emailQueue';
import { ScheduleBatchRequest, ScheduleBatchResponse, PaginationQuery, PaginatedResponse, UserStatsResponse } from '../types/emailJob';
import { JobStatus, Prisma } from '@prisma/client';
import crypto from 'crypto';

export class SchedulerService {
  /**
   * Schedules a batch of emails, calculates staggered timestamps, inserts in PostgreSQL, and enqueues to BullMQ.
   */
  async scheduleBatch(req: ScheduleBatchRequest): Promise<ScheduleBatchResponse> {
    const { subject, body, recipients, startTime, delayBetweenEmails, hourlyLimit, sender } = req;
    
    // Clean and deduplicate recipient list
    const uniqueRecipients = Array.from(
      new Set(
        recipients
          .map((e) => e.trim().toLowerCase())
          .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
      )
    );

    if (uniqueRecipients.length === 0) {
      throw new Error('No valid email recipients provided.');
    }

    const batchId = crypto.randomUUID();
    const startTimestamp = Math.max(new Date(startTime).getTime(), Date.now());
    const delayMs = Math.max(0, delayBetweenEmails * 1000);

    const emailJobsData = uniqueRecipients.map((recipient, index) => {
      const scheduledAtMs = startTimestamp + index * delayMs;
      const scheduledAt = new Date(scheduledAtMs);
      const id = crypto.randomUUID();

      return {
        id,
        recipient,
        subject,
        body,
        scheduledAt,
        status: JobStatus.scheduled,
        sender: sender.toLowerCase(),
        delay: delayBetweenEmails,
        hourlyLimit,
        batchId,
      };
    });

    // 1. Bulk insert into PostgreSQL via Prisma transaction
    await prisma.$transaction(
      emailJobsData.map((job) =>
        prisma.emailJob.create({
          data: {
            id: job.id,
            recipient: job.recipient,
            subject: job.subject,
            body: job.body,
            scheduledAt: job.scheduledAt,
            status: job.status,
            sender: job.sender,
            delay: job.delay,
            hourlyLimit: job.hourlyLimit,
            batchId: job.batchId,
          },
        })
      )
    );

    // 2. Enqueue delayed jobs into BullMQ with deterministic ID for idempotency
    const bullJobs = emailJobsData.map((job) => {
      const delay = Math.max(0, job.scheduledAt.getTime() - Date.now());
      return {
        name: `email-${job.id}`,
        data: {
          id: job.id,
          recipient: job.recipient,
          subject: job.subject,
          body: job.body,
          sender: job.sender,
          scheduledAt: job.scheduledAt.toISOString(),
          delay: job.delay,
          hourlyLimit: job.hourlyLimit,
          batchId: job.batchId,
        },
        opts: {
          delay,
          jobId: `job_${job.id}`, // Guaranteed idempotency
        },
      };
    });

    await emailQueue.addBulk(bullJobs);

    console.log(`[SchedulerService] Successfully scheduled batch ${batchId} with ${uniqueRecipients.length} jobs for sender ${sender}.`);

    return {
      success: true,
      message: `Successfully scheduled ${uniqueRecipients.length} emails.`,
      batchId,
      totalScheduled: uniqueRecipients.length,
    };
  }

  /**
   * Retrieves paginated scheduled/pending/failed emails.
   */
  async getScheduledJobs(query: PaginationQuery): Promise<PaginatedResponse<any>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;
    const search = query.search?.trim() || '';
    const sortBy = query.sortBy || 'scheduledAt';
    const sortOrder = query.sortOrder || 'asc';
    const sender = query.sender?.toLowerCase();

    const where: Prisma.EmailJobWhereInput = {
      status: {
        in: [JobStatus.scheduled, JobStatus.queued, JobStatus.sending, JobStatus.failed],
      },
      ...(sender && { sender }),
      ...(search && {
        OR: [
          { recipient: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await Promise.all([
      prisma.emailJob.count({ where }),
      prisma.emailJob.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    return {
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Retrieves paginated successfully sent emails.
   */
  async getSentJobs(query: PaginationQuery): Promise<PaginatedResponse<any>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;
    const search = query.search?.trim() || '';
    const sortBy = query.sortBy || 'sentAt';
    const sortOrder = query.sortOrder || 'desc';
    const sender = query.sender?.toLowerCase();

    const where: Prisma.EmailJobWhereInput = {
      status: JobStatus.sent,
      ...(sender && { sender }),
      ...(search && {
        OR: [
          { recipient: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await Promise.all([
      prisma.emailJob.count({ where }),
      prisma.emailJob.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    return {
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Retrieves dashboard statistics for a specific user/sender.
   */
  async getUserStats(senderEmail: string, userName?: string, userImage?: string): Promise<UserStatsResponse> {
    const sender = senderEmail.toLowerCase();
    
    const [totalScheduled, totalSent, totalFailed] = await Promise.all([
      prisma.emailJob.count({
        where: {
          sender,
          status: { in: [JobStatus.scheduled, JobStatus.queued, JobStatus.sending] },
        },
      }),
      prisma.emailJob.count({
        where: { sender, status: JobStatus.sent },
      }),
      prisma.emailJob.count({
        where: { sender, status: JobStatus.failed },
      }),
    ]);

    const totalProcessed = totalSent + totalFailed;
    const successRate = totalProcessed > 0 ? parseFloat(((totalSent / totalProcessed) * 100).toFixed(1)) : 100.0;

    return {
      success: true,
      user: {
        email: senderEmail,
        name: userName || senderEmail.split('@')[0] || 'User',
        image: userImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      stats: {
        totalScheduled,
        totalSent,
        totalFailed,
        successRate,
      },
    };
  }
}

export const schedulerService = new SchedulerService();
