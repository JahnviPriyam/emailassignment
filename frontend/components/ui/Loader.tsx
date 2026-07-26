import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export interface LoaderProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullPage?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ text, size = 'md', className, fullPage = false }) => {
  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const content = (
    <div className={clsx("flex flex-col items-center justify-center gap-3 text-slate-600", className)}>
      <Loader2 className={clsx("animate-spin text-pastel-pink-dark", iconSizes[size])} />
      {text && <span className="text-sm font-medium animate-pulse">{text}</span>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-pastel-blue-bg/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};
