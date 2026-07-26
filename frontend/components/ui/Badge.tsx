import React from 'react';
import clsx from 'clsx';

export type BadgeStatus = 'scheduled' | 'queued' | 'sending' | 'sent' | 'failed' | 'default' | 'info' | 'success';

export interface BadgeProps {
  children: React.ReactNode;
  status?: BadgeStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, status = 'default', className, size = 'sm' }) => {
  const statusStyles: Record<BadgeStatus, string> = {
    scheduled: "bg-pastel-pink-bg text-pastel-pink-dark border border-pastel-pink/30 font-medium",
    queued: "bg-amber-50 text-amber-700 border border-amber-200 font-medium",
    sending: "bg-purple-50 text-purple-700 border border-purple-200 font-medium animate-pulse",
    sent: "bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium",
    failed: "bg-rose-50 text-rose-700 border border-rose-200 font-medium",
    default: "bg-slate-100 text-slate-700 border border-slate-200 font-medium",
    info: "bg-pastel-blue-light text-blue-700 border border-pastel-blue/30 font-medium",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium",
  };

  const sizes = {
    sm: "text-xs px-2.5 py-0.5 rounded-full",
    md: "text-sm px-3.5 py-1 rounded-full",
  };

  return (
    <span className={clsx("inline-flex items-center justify-center select-none", statusStyles[status], sizes[size], className)}>
      {children}
    </span>
  );
};
