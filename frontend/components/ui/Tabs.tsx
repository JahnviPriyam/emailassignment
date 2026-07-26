"use client";

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ items, activeId, onChange, className }) => {
  return (
    <div className={clsx("inline-flex items-center gap-1 p-1 bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm select-none", className)}>
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              "relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 z-10",
              isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-pastel-blue rounded-xl shadow-soft-sm -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={clsx(
                  "text-xs px-2 py-0.5 rounded-full font-bold transition-colors",
                  isActive ? "bg-white/80 text-slate-900" : "bg-slate-100 text-slate-600"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
