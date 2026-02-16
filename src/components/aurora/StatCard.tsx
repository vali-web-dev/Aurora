import { Card } from '@/components/aurora/Card';
import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  helper?: string;
}

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <Card>
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="aurora-label text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            {value}
          </p>
        </div>
        {helper && (
          <div className="border-t border-slate-200/70 pt-2 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
            {helper}
          </div>
        )}
      </div>
    </Card>
  );
}
