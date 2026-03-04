'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';

interface HumanBlueprintProgressRailProps {
  exploredCount: number;
  masteredCount: number;
  totalCount: number;
  lastVisitLabel: string;
}

export function HumanBlueprintProgressRail({ exploredCount, masteredCount, totalCount, lastVisitLabel }: HumanBlueprintProgressRailProps) {
  const exploredPercent = totalCount === 0 ? 0 : Math.round((exploredCount / totalCount) * 100);
  const masteredPercent = totalCount === 0 ? 0 : Math.round((masteredCount / totalCount) * 100);

  return (
    <Card className="space-y-4">
      <CardHeader>
        <CardTitle>Blueprint Progress Rail</CardTitle>
        <CardDescription>Continuity-focused tracking for exploration, mastery, and gentle return rhythms.</CardDescription>
      </CardHeader>

      <div className="flex items-center gap-2">
        <Badge variant="primary" size="sm">Explored {exploredCount}/{totalCount}</Badge>
        <Badge variant="success" size="sm">Mastered {masteredCount}/{totalCount}</Badge>
        <Badge variant="info" size="sm">{lastVisitLabel}</Badge>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Exploration Coverage</p>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${exploredPercent}%` }} />
          </div>
          <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">{exploredPercent}% complete</p>
        </div>

        <div className="space-y-1.5">
          <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Mastery Coverage</p>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${masteredPercent}%` }} />
          </div>
          <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">{masteredPercent}% complete</p>
        </div>
      </div>
    </Card>
  );
}
