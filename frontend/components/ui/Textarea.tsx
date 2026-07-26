import React, { forwardRef } from 'react';
import clsx from 'clsx';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, rows = 4, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-semibold text-slate-800 select-none">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={clsx(
            "w-full bg-white text-slate-900 text-sm rounded-xl border p-4 transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 resize-y",
            error
              ? "border-rose-400 focus:ring-rose-200 focus:border-rose-500"
              : "border-slate-200 focus:border-pastel-blue focus:ring-pastel-blue/30 hover:border-slate-300",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs font-medium text-rose-500 mt-0.5">{error}</span>}
        {!error && helperText && <span className="text-xs text-slate-500 mt-0.5">{helperText}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
