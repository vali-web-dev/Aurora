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
      <div className="space-y-2">
        <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          {value}
        </p>
        {helper && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helper}</p>
        )}
      </div>
    </Card>
  );
}
