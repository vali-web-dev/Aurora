import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
}

export function Card({ children, className, hoverable = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6',
        'transition-all duration-200',
        hoverable && 'hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardSectionProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardSectionProps) {
  return <div className={cn('space-y-1', className)}>{children}</div>;
}

export function CardTitle({ children, className }: CardSectionProps) {
  return (
    <h3 className={cn('aurora-label text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }: CardSectionProps) {
  return (
    <p className={cn('aurora-label text-sm text-slate-600 dark:text-slate-400', className)}>
      {children}
    </p>
  );
}

export function CardFooter({ children, className }: CardSectionProps) {
  return (
    <div className={cn('mt-4 border-t border-slate-200/70 pt-4 dark:border-slate-800/80', className)}>
      {children}
    </div>
  );
}
