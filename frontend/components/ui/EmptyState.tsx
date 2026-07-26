import React from 'react';
import { Inbox, LucideIcon } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No emails found",
  description = "Get started by scheduling your first email campaign or upload a CSV list of recipients.",
  icon: Icon = Inbox,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white/60 rounded-3xl border border-dashed border-slate-200 my-6">
      <div className="w-16 h-16 rounded-2xl bg-pastel-pink-bg text-pastel-pink-dark flex items-center justify-center mb-4 shadow-soft-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-slate-800">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
