import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

export const metadata: Metadata = {
  title: 'ReachInbox Scheduler | Production Email Automation SaaS',
  description: 'Production-grade full-stack email job scheduler with BullMQ, Redis, PostgreSQL, Next.js 15, and elegant Pastel SaaS interface.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-pastel-blue-bg text-slate-900 selection:bg-pastel-pink-light selection:text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
