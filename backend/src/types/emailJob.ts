import { JobStatus } from '@prisma/client';

export interface ScheduleBatchRequest {
  subject: string;
  body: string;
  recipients: string[];
  startTime: string; // ISO String
  delayBetweenEmails: number; // in seconds
  hourlyLimit: number;
  sender: string;
}

export interface ScheduleBatchResponse {
  success: boolean;
  message: string;
  batchId: string;
  totalScheduled: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  sender?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EmailJobData {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  sender: string;
  scheduledAt: string;
  delay: number;
  hourlyLimit: number;
  batchId?: string;
}

export interface UserStatsResponse {
  success: boolean;
  user: {
    email: string;
    name: string;
    image?: string;
  };
  stats: {
    totalScheduled: number;
    totalSent: number;
    totalFailed: number;
    successRate: number;
  };
}
