"use client";

import React from 'react';
import { signOut, useSession } from 'next-auth/react';
import { LogOut, Sparkles } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { apiService } from '@/lib/api';

export const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const user = session?.user;

  const handleLogout = async () => {
    if (user?.email) {
      await apiService.logoutBackend(user.email);
    }
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-soft-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Dashboard Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pastel-pink-vibrant to-pastel-blue flex items-center justify-center text-slate-900 shadow-soft-sm">
            <Sparkles className="w-5 h-5 fill-slate-900" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              ReachInbox <span className="text-pastel-pink-dark font-extrabold">Scheduler</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">Production Email Job Automation</p>
          </div>
        </div>

        {/* User Profile & Logout */}
        {user ? (
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 pl-3 pr-4 py-1.5 rounded-2xl bg-pastel-blue-light/40 border border-pastel-blue/30">
              <Avatar src={user.image} name={user.name} size="sm" />
              <div className="hidden md:flex flex-col text-left min-w-0">
                <span className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{user.name}</span>
                <span className="text-xs text-slate-500 truncate max-w-[150px]">{user.email}</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-4 h-4" />}
              className="border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
            >
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        ) : (
          <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            Not Authenticated
          </div>
        )}
      </div>
    </header>
  );
};
