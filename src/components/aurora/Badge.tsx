import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'md', className, ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-200 text-slate-900 ring-1 ring-inset ring-slate-300/70 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700/70',
    primary: 'bg-blue-100 text-blue-900 ring-1 ring-inset ring-blue-200/80 dark:bg-blue-900/60 dark:text-blue-100 dark:ring-blue-700/60',
    success: 'bg-green-100 text-green-900 ring-1 ring-inset ring-green-200/80 dark:bg-green-900/60 dark:text-green-100 dark:ring-green-700/60',
    warning: 'bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-200/80 dark:bg-amber-900/60 dark:text-amber-100 dark:ring-amber-700/60',
    error: 'bg-red-100 text-red-900 ring-1 ring-inset ring-red-200/80 dark:bg-red-900/60 dark:text-red-100 dark:ring-red-700/60',
    info: 'bg-cyan-100 text-cyan-900 ring-1 ring-inset ring-cyan-200/80 dark:bg-cyan-900/60 dark:text-cyan-100 dark:ring-cyan-700/60',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-[11px]',
    md: 'px-3 py-1.5 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold leading-none tracking-wide whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
