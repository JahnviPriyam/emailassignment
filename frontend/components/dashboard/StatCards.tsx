"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Clock, Send, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { apiService } from '@/lib/api';

export const StatCards: React.FC = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const sender = user?.email || 'admin@reachinbox.ai';

  const { data, isLoading } = useQuery({
    queryKey: ['userStats', sender],
    queryFn: async () => await apiService.getUserStats(sender, user?.name || undefined, user?.image || undefined),
    enabled: !!sender,
    refetchInterval: 10000, // Poll every 10 seconds for live updates
  });

  const stats = data?.stats || {
    totalScheduled: 0,
    totalSent: 0,
    totalFailed: 0,
    successRate: 100.0,
  };

  const cards = [
    {
      title: 'Scheduled / Pending',
      value: stats.totalScheduled,
      subtitle: 'In BullMQ Delayed Queue',
      icon: Clock,
      colorClass: 'bg-pastel-pink-bg text-pastel-pink-dark border-pastel-pink/30',
      iconBg: 'bg-pastel-pink-vibrant/20 text-pastel-pink-dark',
    },
    {
      title: 'Successfully Sent',
      value: stats.totalSent,
      subtitle: 'Delivered via Ethereal SMTP',
      icon: Send,
      colorClass: 'bg-pastel-blue-light/50 text-slate-900 border-pastel-blue/30',
      iconBg: 'bg-pastel-blue text-slate-900',
    },
    {
      title: 'Failed Delivery',
      value: stats.totalFailed,
      subtitle: 'Exhausted retry attempts',
      icon: AlertTriangle,
      colorClass: 'bg-rose-50/70 text-rose-800 border-rose-200/60',
      iconBg: 'bg-rose-100 text-rose-600',
    },
    {
      title: 'Delivery Success Rate',
      value: `${stats.successRate}%`,
      subtitle: 'Reliability metric',
      icon: TrendingUp,
      colorClass: 'bg-gradient-to-tr from-pastel-pink-bg via-white to-pastel-blue-light/40 text-slate-900 border-slate-200/80',
      iconBg: 'bg-emerald-100 text-emerald-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            hoverable
            className={`p-5 rounded-3xl border flex flex-col justify-between transition-all duration-300 ${card.colorClass}`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{card.title}</span>
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-soft-sm ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              {isLoading ? (
                <div className="h-8 bg-slate-200/60 animate-pulse rounded-xl w-24 mb-1" />
              ) : (
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{card.value}</div>
              )}
              <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-pastel-pink-dark" />
                <span>{card.subtitle}</span>
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
