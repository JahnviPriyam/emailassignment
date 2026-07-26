export interface EmailJob {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt?: string;
  sentAt?: string;
  status: 'scheduled' | 'queued' | 'sending' | 'sent' | 'failed';
  sender: string;
  delay?: number;
  hourlyLimit?: number;
  errorReason?: string;
}

export interface UserStats {
  totalScheduled: number;
  totalSent: number;
  totalFailed: number;
  successRate: number;
}

export interface UserProfile {
  email: string;
  name: string;
  image?: string;
}

export interface PaginatedEmailResponse {
  success: boolean;
  data: EmailJob[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ScheduleBatchPayload {
  subject: string;
  body: string;
  recipients: string[];
  startTime: string; // ISO string
  delayBetweenEmails: number;
  hourlyLimit: number;
  sender: string;
}

export interface ScheduleBatchResponse {
  success: boolean;
  message: string;
  batchId: string;
  totalScheduled: number;
}
