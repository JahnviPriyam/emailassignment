import axios from 'axios';
import { ScheduleBatchPayload, ScheduleBatchResponse, PaginatedEmailResponse, UserStats, UserProfile } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  scheduleEmails: async (payload: ScheduleBatchPayload): Promise<ScheduleBatchResponse> => {
    const response = await apiClient.post<ScheduleBatchResponse>('/schedule', payload);
    return response.data;
  },

  getScheduledEmails: async (params: {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    sender?: string;
  }): Promise<PaginatedEmailResponse> => {
    const response = await apiClient.get<PaginatedEmailResponse>('/scheduled', { params });
    return response.data;
  },

  getSentEmails: async (params: {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    sender?: string;
  }): Promise<PaginatedEmailResponse> => {
    const response = await apiClient.get<PaginatedEmailResponse>('/sent', { params });
    return response.data;
  },

  getUserStats: async (sender: string, name?: string, image?: string): Promise<{
    success: boolean;
    user: UserProfile;
    stats: UserStats;
  }> => {
    const response = await apiClient.get('/user', {
      params: { sender, name, image },
    });
    return response.data;
  },

  logoutBackend: async (email?: string): Promise<void> => {
    try {
      await apiClient.post('/logout', { email });
    } catch (e) {
      console.warn('Backend logout non-fatal error:', e);
    }
  },
};
