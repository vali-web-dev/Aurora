'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/aurora/Card';
import type { BlueprintPhase, HumanBlueprintNode } from '@/lib/human-blueprint/schema';
import { Badge } from '@/components/aurora/Badge';

interface HumanBlueprintInsightPanelProps {
  node: HumanBlueprintNode | null;
  phase: BlueprintPhase;
}

export function HumanBlueprintInsightPanel({ node, phase }: HumanBlueprintInsightPanelProps) {
  if (!node) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Human Blueprint Insight Panel</CardTitle>
          <CardDescription>Select an organ, system, or feature to open layered guidance.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <CardHeader>
        <CardTitle>Human Blueprint Insight Panel</CardTitle>
        <CardDescription>{node.name} • phase-aware guidance from physiology to long-term trajectory.</CardDescription>
      </CardHeader>

      <div className="flex items-center gap-2">
        <Badge variant="primary" size="sm">{node.category}</Badge>
        <Badge variant="info" size="sm">Phase {phase}</Badge>
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
          <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Layer 1 — Core Facts</p>
          <p className="aurora-label text-sm text-slate-800 dark:text-slate-200 mt-1">{node.summary}</p>
          {phase >= 3 && <p className="aurora-label text-sm text-slate-700 dark:text-slate-300 mt-2">{node.function_physical}</p>}
        </div>

        {phase >= 2 && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
            <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Layer 2 — Lifestyle Links</p>
            <p className="aurora-label text-sm text-slate-700 dark:text-slate-300 mt-1">Support: {node.lifestyle_support.join(' • ')}</p>
            <p className="aurora-label text-sm text-slate-700 dark:text-slate-300 mt-1">Harm: {node.lifestyle_harm.join(' • ')}</p>
          </div>
        )}

        {phase >= 3 && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
            <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Layer 3 — Emotional/Psychological</p>
            <p className="aurora-label text-sm text-slate-700 dark:text-slate-300 mt-1">{node.function_emotional_psychological}</p>
            <p className="aurora-label text-sm text-slate-700 dark:text-slate-300 mt-1">{node.psychological_identity}</p>
          </div>
        )}

        {phase >= 4 && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
            <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Layer 4 — Mythic Narrative</p>
            <p className="aurora-label text-sm text-amber-700 dark:text-amber-300 mt-1">{node.mythic_identity}</p>
            <p className="aurora-label text-sm text-slate-700 dark:text-slate-300 mt-1">{node.narrative_voice}</p>
          </div>
        )}

        {phase >= 5 && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
            <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Layer 5 — Mastery</p>
            <p className="aurora-label text-sm text-emerald-700 dark:text-emerald-300 mt-1">If honored: {node.if_honor_this}</p>
            <p className="aurora-label text-sm text-amber-700 dark:text-amber-300 mt-1">If ignored: {node.if_ignore_this}</p>
            <p className="aurora-label text-sm text-slate-700 dark:text-slate-300 mt-1">{node.transformation_arc}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
