"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { ArrowUpDown, Mail, Calendar, Clock, RefreshCw, Send, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { Badge, BadgeStatus } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Search } from '../ui/Search';
import { Pagination } from '../ui/Pagination';
import { EmptyState } from '../ui/EmptyState';
import { Card } from '../ui/Card';
import { apiService } from '@/lib/api';
import { EmailJob } from '@/types';

export interface EmailTableProps {
  type: 'scheduled' | 'sent';
  onComposeClick?: () => void;
}

export const EmailTable: React.FC<EmailTableProps> = ({ type, onComposeClick }) => {
  const { data: session } = useSession();
  const sender = session?.user?.email || 'admin@reachinbox.ai';

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(type === 'scheduled' ? 'scheduledAt' : 'sentAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(type === 'scheduled' ? 'asc' : 'desc');

  const queryKey = [type === 'scheduled' ? 'scheduledEmails' : 'sentEmails', page, limit, search, sortBy, sortOrder, sender];

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey,
    queryFn: async () => {
      if (type === 'scheduled') {
        return await apiService.getScheduledEmails({ page, limit, search, sortBy, sortOrder, sender });
      } else {
        return await apiService.getSentEmails({ page, limit, search, sortBy, sortOrder, sender });
      }
    },
    enabled: !!sender,
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const getStatusBadge = (status: EmailJob['status']) => {
    const map: Record<EmailJob['status'], { label: string; status: BadgeStatus }> = {
      scheduled: { label: 'Scheduled', status: 'scheduled' },
      queued: { label: 'Queued', status: 'queued' },
      sending: { label: 'Sending...', status: 'sending' },
      sent: { label: 'Sent', status: 'sent' },
      failed: { label: 'Failed', status: 'failed' },
    };
    const mapped = map[status] || { label: status, status: 'default' };
    return <Badge status={mapped.status}>{mapped.label}</Badge>;
  };

  const jobs = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  return (
    <Card className="flex flex-col gap-5 p-5 sm:p-6 shadow-soft-sm">
      {/* Table Action Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <Search
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder={`Search ${type} emails by recipient or subject...`}
          className="max-w-md"
        />

        <div className="flex items-center justify-end gap-2.5 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            leftIcon={<RefreshCw className={clsx("w-3.5 h-3.5", isRefetching && "animate-spin")} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 bg-white">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 bg-pastel-blue-light/30 text-slate-700 text-xs uppercase tracking-wider font-bold select-none">
              <th className="py-3.5 px-4 rounded-tl-2xl">Recipient</th>
              <th className="py-3.5 px-4">Subject</th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:bg-pastel-blue-light/50 transition-colors"
                onClick={() => handleSort(type === 'scheduled' ? 'scheduledAt' : 'sentAt')}
              >
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-pastel-blue-dark" />
                  <span>{type === 'scheduled' ? 'Scheduled Time' : 'Sent Time'}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400 ml-0.5" />
                </div>
              </th>
              <th className="py-3.5 px-4">Status</th>
              {type === 'scheduled' && (
                <>
                  <th className="py-3.5 px-4">Delay</th>
                  <th className="py-3.5 px-4 rounded-tr-2xl">Hourly Limit</th>
                </>
              )}
              {type === 'sent' && <th className="py-3.5 px-4 rounded-tr-2xl">Delivery Details</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm">
            {isLoading && (
              /* Skeleton rows */
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse bg-white">
                  <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-44" /></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-60" /></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-36" /></td>
                  <td className="py-4 px-4"><div className="h-5 bg-slate-100 rounded-full w-20" /></td>
                  {type === 'scheduled' && (
                    <>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-12" /></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-16" /></td>
                    </>
                  )}
                  {type === 'sent' && <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-24" /></td>}
                </tr>
              ))
            )}

            {!isLoading && !isError && jobs.length === 0 && (
              <tr>
                <td colSpan={type === 'scheduled' ? 6 : 5} className="py-8">
                  <EmptyState
                    title={search ? "No search results found" : `No ${type} emails yet`}
                    description={
                      search
                        ? `We couldn't find any emails matching "${search}". Try another keyword.`
                        : type === 'scheduled'
                        ? "Your scheduled email queue is empty. Click below to compose a new campaign!"
                        : "No emails have been sent yet. Once scheduled jobs process, they will appear here."
                    }
                    icon={type === 'scheduled' ? Clock : Send}
                    actionLabel={type === 'scheduled' && !search ? "Compose New Email" : undefined}
                    onAction={onComposeClick}
                  />
                </td>
              </tr>
            )}

            {!isLoading && !isError && jobs.map((job) => (
              <tr key={job.id} className="hover:bg-pastel-blue-bg/40 transition-colors group">
                <td className="py-3.5 px-4 font-semibold text-slate-900 truncate max-w-[200px]">
                  {job.recipient}
                </td>
                <td className="py-3.5 px-4 text-slate-700 truncate max-w-[280px]" title={job.subject}>
                  {job.subject}
                </td>
                <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                  {formatDateTime(type === 'scheduled' ? job.scheduledAt : job.sentAt)}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-col items-start gap-1">
                    {getStatusBadge(job.status)}
                    {job.errorReason && (
                      <span className="text-[11px] text-rose-500 font-medium max-w-[180px] truncate" title={job.errorReason}>
                        ⚠️ {job.errorReason}
                      </span>
                    )}
                  </div>
                </td>
                {type === 'scheduled' && (
                  <>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                      {job.delay !== undefined ? `${job.delay}s` : '5s'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                      {job.hourlyLimit !== undefined ? `${job.hourlyLimit}/hr` : '200/hr'}
                    </td>
                  </>
                )}
                {type === 'sent' && (
                  <td className="py-3.5 px-4 text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <span>Delivered via Ethereal</span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!isLoading && jobs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-bold text-slate-800">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-bold text-slate-800">{pagination.total}</span> total entries
          </span>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </Card>
  );
};
