import { Worker, Job } from 'bullmq';
import { QUEUE_NAME, emailQueue } from '../queue/emailQueue';
import { redisConnection } from '../config/redis';
import { config } from '../config/config';
import { prisma } from '../db/prisma';
import { EmailJobData } from '../types/emailJob';
import { checkAndIncrementRateLimit } from './rateLimiter';
import { sendEmail } from '../utils/mailer';

export const startEmailWorker = () => {
  console.log(`[BullMQ Worker] Starting email worker on queue "${QUEUE_NAME}" with concurrency: ${config.workerConcurrency}`);

  const worker = new Worker<EmailJobData>(
    QUEUE_NAME,
    async (job: Job<EmailJobData>) => {
      const { id, recipient, subject, body, sender, hourlyLimit } = job.data;

      console.log(`[Worker] Dequeued job ${job.id} for recipient: ${recipient} (DB ID: ${id})`);

      // Update status in DB to sending
      await prisma.emailJob.update({
        where: { id },
        data: { status: 'sending', errorReason: null },
      });

      // Check hourly rate limit in Redis
      const rateLimit = await checkAndIncrementRateLimit(sender, hourlyLimit);

      if (!rateLimit.allowed) {
        console.warn(
          `[Worker] Hourly limit (${rateLimit.limit}) exceeded for sender ${sender}. Rescheduling job ${id} in ${Math.round(rateLimit.msUntilNextHour / 1000)}s.`
        );

        const newScheduledAt = new Date(Date.now() + rateLimit.msUntilNextHour);

        // Update DB back to scheduled with new timestamp
        await prisma.emailJob.update({
          where: { id },
          data: {
            status: 'scheduled',
            scheduledAt: newScheduledAt,
            errorReason: `Hourly rate limit (${rateLimit.limit}/hr) reached. Rescheduled to next UTC hour window.`,
          },
        });

        // Re-enqueue into BullMQ for the next hour window without marking as failed
        await emailQueue.add(
          `email-${id}-rescheduled`,
          {
            ...job.data,
            scheduledAt: newScheduledAt.toISOString(),
          },
          {
            delay: rateLimit.msUntilNextHour,
            jobId: `resched_${id}_${Date.now()}`,
          }
        );

        return { status: 'rescheduled', nextAttempt: newScheduledAt };
      }

      // We have rate limit capacity! Send email via Ethereal / SMTP
      try {
        const result = await sendEmail(recipient, subject, body, sender);

        // Mark as sent in DB
        await prisma.emailJob.update({
          where: { id },
          data: {
            status: 'sent',
            sentAt: new Date(),
            errorReason: null,
          },
        });

        console.log(`[Worker] Successfully sent email to ${recipient}. MessageID: ${result.messageId}`);
        return { status: 'sent', messageId: result.messageId, previewUrl: result.previewUrl };
      } catch (err: any) {
        console.error(`[Worker] Failed to send email to ${recipient}:`, err.message);

        // Mark as failed in DB after all retry attempts are exhausted
        if (job.attemptsMade >= (job.opts.attempts || 3) - 1) {
          await prisma.emailJob.update({
            where: { id },
            data: {
              status: 'failed',
              errorReason: err.message || 'SMTP Delivery Error',
            },
          });
        } else {
          // Revert back to queued/scheduled for BullMQ automatic retry
          await prisma.emailJob.update({
            where: { id },
            data: {
              status: 'queued',
              errorReason: `Retry ${job.attemptsMade + 1}: ${err.message}`,
            },
          });
        }

        throw err; // Re-throw to trigger BullMQ exponential backoff
      }
    },
    {
      connection: redisConnection,
      concurrency: config.workerConcurrency,
    }
  );

  worker.on('completed', (job, result) => {
    console.log(`[Worker Event] Job ${job.id} completed with status: ${result?.status}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker Event] Job ${job?.id} failed with error:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('[Worker Event] Worker connection error:', err.message);
  });

  return worker;
};
