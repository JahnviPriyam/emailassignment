"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Gauge, Send, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { FileUpload } from '../upload/FileUpload';
import { useToast } from '../ui/Toast';
import { apiService } from '@/lib/api';
import { useSession } from 'next-auth/react';

const composeSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200, 'Subject is too long'),
  body: z.string().min(10, 'Email body must be at least 10 characters'),
  recipients: z.array(z.string().email()).min(1, 'Please upload a valid CSV or TXT file with at least 1 recipient'),
  startTime: z.string().min(1, 'Please select a start date and time'),
  delayBetweenEmails: z
    .number({ invalid_type_error: 'Delay must be a number' })
    .int()
    .min(0, 'Delay cannot be negative'),
  hourlyLimit: z
    .number({ invalid_type_error: 'Hourly limit must be a number' })
    .int()
    .min(1, 'Hourly limit must be at least 1'),
});

type ComposeFormData = z.infer<typeof composeSchema>;

export interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();
  const [fileError, setFileError] = useState<string | null>(null);

  // Set default start time to 5 minutes from now in local timezone ISO string format for input[type="datetime-local"]
  const getDefaultStartTime = () => {
    const now = new Date(Date.now() + 5 * 60 * 1000);
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ComposeFormData>({
    resolver: zodResolver(composeSchema),
    defaultValues: {
      subject: '',
      body: '',
      recipients: [],
      startTime: getDefaultStartTime(),
      delayBetweenEmails: 5,
      hourlyLimit: 200,
    },
  });

  const recipients = watch('recipients');

  useEffect(() => {
    if (isOpen) {
      reset({
        subject: '',
        body: '',
        recipients: [],
        startTime: getDefaultStartTime(),
        delayBetweenEmails: 5,
        hourlyLimit: 200,
      });
      setFileError(null);
    }
  }, [isOpen, reset]);

  const mutation = useMutation({
    mutationFn: async (data: ComposeFormData) => {
      const sender = session?.user?.email || 'admin@reachinbox.ai';
      // Convert local datetime string to UTC ISO string
      const startTimeIso = new Date(data.startTime).toISOString();

      return await apiService.scheduleEmails({
        subject: data.subject,
        body: data.body,
        recipients: data.recipients,
        startTime: startTimeIso,
        delayBetweenEmails: data.delayBetweenEmails,
        hourlyLimit: data.hourlyLimit,
        sender,
      });
    },
    onSuccess: (res) => {
      toastSuccess(
        'Campaign Scheduled! 🎉',
        `Successfully enqueued ${res.totalScheduled} emails with BullMQ delayed jobs.`
      );
      queryClient.invalidateQueries({ queryKey: ['scheduledEmails'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || err.message || 'Failed to schedule emails.';
      toastError('Scheduling Failed', msg);
    },
  });

  const onSubmit = (data: ComposeFormData) => {
    if (data.recipients.length === 0) {
      setFileError('Please upload a CSV or TXT file containing email recipients.');
      return;
    }
    mutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compose New Email Campaign" maxWidth="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Subject */}
        <Input
          label="Email Subject"
          placeholder="e.g. Exclusive Invitation to ReachInbox Scheduler"
          error={errors.subject?.message}
          {...register('subject')}
        />

        {/* Body */}
        <Textarea
          label="Email Content / Body"
          placeholder="Write your email body here... Supports multiline text."
          rows={5}
          error={errors.body?.message}
          {...register('body')}
        />

        {/* File Upload Zone */}
        <Controller
          name="recipients"
          control={control}
          render={({ field }) => (
            <FileUpload
              onEmailsExtracted={(emails) => {
                field.onChange(emails);
                if (emails.length > 0) setFileError(null);
              }}
              error={errors.recipients?.message || fileError || undefined}
            />
          )}
        />

        {/* Scheduling Configuration Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-pastel-blue-bg border border-pastel-blue/30">
          <Input
            type="datetime-local"
            label="Start Time"
            leftIcon={<Calendar className="w-4 h-4 text-pastel-blue-dark" />}
            error={errors.startTime?.message}
            {...register('startTime')}
          />

          <Input
            type="number"
            label="Delay Between (sec)"
            placeholder="5"
            leftIcon={<Clock className="w-4 h-4 text-pastel-blue-dark" />}
            helperText="Staggers each email"
            error={errors.delayBetweenEmails?.message}
            {...register('delayBetweenEmails', { valueAsNumber: true })}
          />

          <Input
            type="number"
            label="Hourly Rate Limit"
            placeholder="200"
            leftIcon={<Gauge className="w-4 h-4 text-pastel-blue-dark" />}
            helperText="Max emails per hr"
            error={errors.hourlyLimit?.message}
            {...register('hourlyLimit', { valueAsNumber: true })}
          />
        </div>

        {/* Summary Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-1">
          <div className="text-xs text-slate-500">
            {recipients.length > 0 ? (
              <span className="font-semibold text-slate-800">
                Ready to schedule <span className="text-pastel-pink-dark font-bold">{recipients.length}</span> recipients
              </span>
            ) : (
              <span>Upload recipients to proceed</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="md" onClick={onClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={mutation.isPending}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Schedule Campaign
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
