import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, hoverable = false, className, ...props }) => {
  return (
    <div
      className={clsx(
        "bg-white rounded-2xl border border-slate-100 shadow-soft-sm p-6 transition-all duration-300",
        hoverable && "hover:shadow-soft-md hover:border-pastel-pink/40",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
