import { Request, Response, NextFunction } from 'express';
import { schedulerService } from '../services/schedulerService';
import { z } from 'zod';

const scheduleBatchSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200),
  body: z.string().min(1, 'Email body is required'),
  recipients: z.array(z.string().email('Invalid email address')).min(1, 'At least one recipient is required'),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start time format' }),
  delayBetweenEmails: z.number().int().min(0, 'Delay must be non-negative'),
  hourlyLimit: z.number().int().min(1, 'Hourly limit must be at least 1'),
  sender: z.string().email('Invalid sender email'),
});

const paginationQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional().default(''),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  sender: z.string().optional(),
});

export class ScheduleController {
  async schedule(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = scheduleBatchSchema.parse(req.body);
      const result = await schedulerService.scheduleBatch(validatedData);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getScheduled(req: Request, res: Response, next: NextFunction) {
    try {
      const query = paginationQuerySchema.parse(req.query);
      const result = await schedulerService.getScheduledJobs(query);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getSent(req: Request, res: Response, next: NextFunction) {
    try {
      const query = paginationQuerySchema.parse(req.query);
      const result = await schedulerService.getSentJobs(query);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const scheduleController = new ScheduleController();
