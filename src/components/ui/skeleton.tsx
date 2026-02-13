'use client';

import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

/**
 * Skeleton Component
 * 
 * Displays animated loading placeholders with Aurora's design aesthetic
 * 
 * Variants:
 * - text: Single line of text
 * - circular: Avatar/icon placeholder
 * - rectangular: Generic box
 * - card: Full card with multiple elements
 * 
 * @see AURORA_DESIGN_CULTURE.md § Component Library § Loading States
 */
export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseClasses = clsx(
    'animate-pulse bg-gradient-to-r',
    'from-slate-200 via-slate-100 to-slate-200',
    'dark:from-slate-800 dark:via-slate-700 dark:to-slate-800',
    'bg-[length:200%_100%]',
    className
  );

  if (variant === 'text') {
    if (lines > 1) {
      return (
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={clsx(
                baseClasses,
                'h-4 rounded',
                i === lines - 1 && 'w-3/4'
              )}
              style={{ width: i === lines - 1 ? undefined : width }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        className={clsx(baseClasses, 'h-4 rounded')}
        style={{ width, height }}
      />
    );
  }

  if (variant === 'circular') {
    return (
      <div
        className={clsx(baseClasses, 'rounded-full')}
        style={{
          width: width || '2.5rem',
          height: height || '2.5rem',
        }}
      />
    );
  }

  if (variant === 'rectangular') {
    return (
      <div
        className={clsx(baseClasses, 'rounded-lg')}
        style={{ width, height }}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={clsx(
          'rounded-xl border border-slate-200 dark:border-slate-800',
          'bg-white dark:bg-slate-900 p-6 space-y-4',
          className
        )}
        style={{ width, height }}
      >
        <div className="flex items-center gap-4">
          <Skeleton variant="circular" width="3rem" height="3rem" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
        <Skeleton variant="rectangular" height="8rem" />
        <div className="space-y-2">
          <Skeleton variant="text" lines={3} />
        </div>
      </div>
    );
  }

  return null;
}

/**
 * SkeletonGrid
 * 
 * Grid of skeleton cards for list/grid loading states
 */
export function SkeletonGrid({ count = 3, columns = 3 }) {
  return (
    <div
      className={clsx(
        'grid gap-6',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-1 md:grid-cols-2',
        columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="card" />
      ))}
    </div>
  );
}
