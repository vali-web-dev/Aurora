'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import type { HumanBlueprintNode } from '@/lib/human-blueprint/schema';

interface HumanBlueprintDailyFocusProps {
  node: HumanBlueprintNode | null;
  phase: number;
}

export function HumanBlueprintDailyFocus({ node, phase }: HumanBlueprintDailyFocusProps) {
  if (!node) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Body Focus</CardTitle>
          <CardDescription>No focus available.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="space-y-3">
      <CardHeader>
        <CardTitle>Daily Body Focus</CardTitle>
        <CardDescription>One concise focus to deepen awareness, behavior, and identity through consistency.</CardDescription>
      </CardHeader>
      <div className="space-y-2">
        <Badge variant="primary" size="sm">Today: {node.name}</Badge>
        <Badge variant="info" size="sm">Phase {phase}</Badge>
        <p className="aurora-label text-sm text-slate-700 dark:text-slate-300">{node.summary}</p>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
          <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Micro-practice</p>
          <p className="aurora-label text-sm text-slate-800 dark:text-slate-200 mt-1">{node.micro_actions[0]}</p>
        </div>
        <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Reflection: {node.reflection_questions[0]}</p>
      </div>
    </Card>
  );
}
