import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';
import { EmailJobData } from '../types/emailJob';

export const QUEUE_NAME = 'email-scheduler-queue';

export const emailQueue = new Queue<EmailJobData>(QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      count: 1000, // Keep last 1000 completed jobs in Redis for inspection
    },
    removeOnFail: {
      count: 1000,
    },
  },
});

emailQueue.on('error', (err) => {
  console.error('[BullMQ Queue] Error:', err.message);
});
