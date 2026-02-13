import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function Card({ children, className, hoverable = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6',
        'transition-all duration-200',
        hoverable && 'hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
