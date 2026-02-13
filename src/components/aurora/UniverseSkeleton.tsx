'use client';

import { Skeleton, SkeletonGrid } from '@/components/ui/skeleton';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';

interface UniverseSkeletonProps {
  /** Show stat cards section */
  showStats?: boolean;
  /** Number of stat cards to show */
  statsCount?: number;
  /** Show grid of items (courses, tasks, etc.) */
  showGrid?: boolean;
  /** Number of grid columns */
  gridCols?: 1 | 2 | 3 | 4;
  /** Number of items in grid */
  itemsCount?: number;
}

export function UniverseSkeleton({
  showStats = true,
  statsCount = 3,
  showGrid = true,
  gridCols = 3,
  itemsCount = 6,
}: UniverseSkeletonProps = {}) {
  return (
    <Surface className="py-8">
      {/* Header skeleton */}
      <div className="space-y-4 mb-8">
        <Skeleton variant="text" className="h-8 w-64" />
        <Skeleton variant="text" className="h-4 w-96" />
      </div>

      {/* Stats section skeleton */}
      {showStats && (
        <div className="space-y-4 mb-12">
          <Skeleton variant="text" className="h-6 w-48" />
          <SkeletonGrid count={statsCount} columns={statsCount as any} />
        </div>
      )}

      {/* Grid section skeleton */}
      {showGrid && (
        <div className="space-y-6">
          <Skeleton variant="text" className="h-6 w-40" />
          <SkeletonGrid count={itemsCount} columns={gridCols} />
        </div>
      )}
    </Surface>
  );
}

/**
 * StatCard skeleton for loading states
 */
export function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-3">
      <Skeleton variant="text" className="h-4 w-24" />
      <Skeleton variant="text" className="h-8 w-16" />
      <Skeleton variant="text" className="h-3 w-32" />
    </div>
  );
}

/**
 * Course card skeleton for Learning universe
 */
export function CourseCardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-4">
      <div className="space-y-2">
        <Skeleton variant="rectangular" className="h-32 w-full rounded-lg" />
        <Skeleton variant="text" className="h-6 w-3/4" />
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-5/6" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton variant="text" className="h-4 w-20" />
        <Skeleton variant="text" className="h-4 w-16" />
      </div>
    </div>
  );
}

/**
 * Task card skeleton for Productivity universe
 */
export function TaskCardSkeleton() {
  return (
    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2">
      <Skeleton variant="text" className="h-4 w-3/4" />
      <Skeleton variant="text" className="h-3 w-full" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton variant="rectangular" className="h-5 w-12 rounded" />
        <Skeleton variant="text" className="h-3 w-16" />
      </div>
    </div>
  );
}
