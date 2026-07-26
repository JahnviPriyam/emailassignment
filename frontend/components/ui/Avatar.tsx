import React from 'react';
import clsx from 'clsx';

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', className }) => {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div
      className={clsx(
        "relative rounded-full overflow-hidden flex items-center justify-center font-bold select-none border-2 border-pastel-pink/30 bg-pastel-blue-light text-slate-800 shrink-0",
        sizes[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
};
