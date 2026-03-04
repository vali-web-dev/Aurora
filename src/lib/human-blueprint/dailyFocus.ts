import type { HumanBlueprintNode } from '@/lib/human-blueprint/schema';

export function getDailyFocusNode(nodes: HumanBlueprintNode[], date = new Date()): HumanBlueprintNode | null {
  if (nodes.length === 0) return null;
  const utcMidnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const dayIndex = Math.floor(utcMidnight / 86400000);
  return nodes[Math.abs(dayIndex) % nodes.length] ?? null;
}

export function formatTimelineDate(value: number): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
