import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50',
    primary: 'bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100',
    success: 'bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-100',
    warning: 'bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100',
    error: 'bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100',
    info: 'bg-cyan-200 dark:bg-cyan-900 text-cyan-900 dark:text-cyan-100',
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-block font-semibold rounded-full',
        variantStyles[variant],
        sizeStyles[size]
      )}
    >
      {children}
    </span>
  );
}
