"use client";

import React, { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Clock, CheckCircle2, ShieldCheck, Mail, ArrowRight, Lock, Zap } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { StatCards } from '@/components/dashboard/StatCards';
import { EmailTable } from '@/components/dashboard/EmailTable';
import { ComposeModal } from '@/components/dashboard/ComposeModal';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'scheduled' | 'sent'>('scheduled');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  // Loading Session State
  if (status === 'loading') {
    return <Loader fullPage text="Loading ReachInbox Scheduler..." size="lg" />;
  }

  // Unauthenticated SaaS Landing / Login Card
  if (!session) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-br from-pastel-blue-bg via-[#eaf4fe] to-pastel-pink-bg p-6 sm:p-10 relative overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-pastel-blue/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-pastel-pink/20 blur-3xl pointer-events-none" />

        {/* Minimal Header */}
        <header className="flex items-center justify-between max-w-6xl mx-auto w-full z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pastel-pink-vibrant to-pastel-blue flex items-center justify-center text-slate-900 shadow-soft-sm">
              <Sparkles className="w-5 h-5 fill-slate-900" />
            </div>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight">ReachInbox <span className="text-pastel-pink-dark">Scheduler</span></span>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-soft-sm">
            SDE Assignment v1.0
          </span>
        </header>

        {/* Main Login Card */}
        <main className="flex-1 flex items-center justify-center py-12 z-10">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
            className="w-full max-w-md"
          >
            <Card className="p-8 sm:p-10 rounded-3xl shadow-soft-lg border-2 border-white/80 bg-white/95 backdrop-blur-xl flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-pastel-pink-bg text-pastel-pink-dark flex items-center justify-center mb-6 shadow-soft-sm border border-pastel-pink/30">
                <Lock className="w-7 h-7" />
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
              <p className="text-sm text-slate-500 mt-2 mb-8 leading-relaxed">
                Sign in to manage your automated email job queues, configure BullMQ rate limits, and dispatch campaigns.
              </p>

              {/* Google OAuth Button */}
              <Button
                variant="outline"
                size="lg"
                onClick={() => signIn('google', { callbackUrl: '/' })}
                className="w-full justify-center border-slate-200 hover:border-pastel-blue hover:bg-pastel-blue-light/30 text-slate-800 font-bold mb-4 shadow-soft-sm"
                leftIcon={
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                }
              >
                Continue with Google
              </Button>

              <div className="w-full flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Or Instant Dev Access</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Dev / Demo Login Button */}
              <Button
                variant="primary"
                size="lg"
                isLoading={isDemoLoading}
                onClick={async () => {
                  setIsDemoLoading(true);
                  await signIn('credentials', {
                    email: 'admin@reachinbox.ai',
                    name: 'Jahnvi Priyam',
                    callbackUrl: '/',
                  });
                }}
                className="w-full justify-center bg-pastel-pink-vibrant hover:bg-pastel-pink-dark text-slate-900 font-bold shadow-soft-md mt-2"
                leftIcon={<Zap className="w-5 h-5 fill-slate-900" />}
              >
                Explore Demo Dashboard
              </Button>

              {/* Security Badge */}
              <div className="mt-8 flex items-center gap-2 text-xs text-slate-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>256-Bit SSL Encrypted & BullMQ Idempotent</span>
              </div>
            </Card>
          </motion.div>
        </main>

        {/* Minimal Footer */}
        <footer className="text-center text-xs text-slate-500 max-w-6xl mx-auto w-full z-10">
          Built with Next.js 15, BullMQ, Redis, PostgreSQL, and strictly Pastel Pink & Blue aesthetics.
        </footer>
      </div>
    );
  }

  // Authenticated Dashboard Interface
  return (
    <div className="min-h-screen flex flex-col bg-pastel-blue-bg">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Top Campaign Welcome Banner & Compose Trigger */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-white via-white to-pastel-blue-light/40 border border-slate-100 shadow-soft-sm">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pastel-pink-bg text-pastel-pink-dark border border-pastel-pink/30">
                Active Workspace
              </span>
              <span className="text-xs text-slate-500 font-medium">• Ethereal SMTP Ready</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Campaign Automation Overview
            </h2>
            <p className="text-sm text-slate-600 max-w-xl">
              Schedule staggered batch deliveries, configure hourly Redis rate limits, and monitor real-time worker execution.
            </p>
          </div>

          {/* Large Pastel Pink Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsComposeOpen(true)}
            className="shrink-0 text-base py-4 px-8 shadow-soft-md hover:shadow-soft-lg transform hover:-translate-y-0.5 transition-all bg-pastel-pink-vibrant hover:bg-pastel-pink-dark font-bold rounded-2xl"
            leftIcon={<Send className="w-5 h-5 fill-slate-900" />}
          >
            Compose New Email
          </Button>
        </div>

        {/* Summary Metric Cards */}
        <StatCards />

        {/* Tabs & Table Section */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Tabs
              items={[
                { id: 'scheduled', label: 'Scheduled Emails', icon: <Clock className="w-4 h-4 text-pastel-blue-dark" /> },
                { id: 'sent', label: 'Sent Emails', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" /> },
              ]}
              activeId={activeTab}
              onChange={(id) => setActiveTab(id as 'scheduled' | 'sent')}
            />

            <div className="text-xs text-slate-500 font-medium flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200/60 shadow-soft-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>BullMQ Workers Active (Concurrency: 5)</span>
            </div>
          </div>

          {/* Email Job Table */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <EmailTable
              type={activeTab}
              onComposeClick={() => setIsComposeOpen(true)}
            />
          </motion.div>
        </div>
      </main>

      {/* Compose Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />
    </div>
  );
}
