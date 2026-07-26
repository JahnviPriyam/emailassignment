"use client";

import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import clsx from 'clsx';

export interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export const Search: React.FC<SearchProps> = ({
  value,
  onChange,
  placeholder = "Search emails by recipient or subject...",
  className,
  debounceMs = 300,
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);
    return () => clearTimeout(handler);
  }, [localValue, debounceMs, onChange, value]);

  return (
    <div className={clsx("relative flex items-center w-full max-w-md", className)}>
      <SearchIcon className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white text-slate-900 text-sm rounded-xl border border-slate-200 pl-10 pr-9 py-2 transition-all placeholder:text-slate-400 focus:outline-none focus:border-pastel-blue focus:ring-2 focus:ring-pastel-blue/30"
      />
      {localValue && (
        <button
          onClick={() => {
            setLocalValue('');
            onChange('');
          }}
          className="absolute right-3 p-0.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
