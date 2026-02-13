import clsx from 'clsx';
import type { ReactNode } from 'react';

interface SurfaceProps {
  children: ReactNode;
  className?: string;
}

interface SurfaceHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

interface SurfaceSectionProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Surface({ children, className }: SurfaceProps) {
  return (
    <div className={clsx('space-y-8', className)}>
      {children}
    </div>
  );
}

export function SurfaceHeader({ title, description, actions, className }: SurfaceHeaderProps) {
  return (
    <div className={clsx('flex flex-col gap-3 md:flex-row md:items-end md:justify-between', className)}>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">
          {title}
        </h1>
        {description && (
          <p className="text-slate-600 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

export function SurfaceSection({ title, description, actions, className, children }: SurfaceSectionProps) {
  return (
    <section className={clsx('space-y-4', className)}>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}
