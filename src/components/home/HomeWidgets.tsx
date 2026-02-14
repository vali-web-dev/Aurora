'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/aurora/Button';
import { cn, formatLongDate, formatTime } from '@/lib/utils';

const moodOptions = [
  { label: 'Focused', color: 'info' },
  { label: 'Calm', color: 'success' },
  { label: 'Inspired', color: 'primary' },
  { label: 'Reflective', color: 'default' },
];

const financeSummary = {
  budget: 1200,
  spent: 640,
  savings: 320,
};

const trending = [
  { label: 'Aurora Town Hall', type: 'Live Event' },
  { label: 'Focus Ritual Playlist', type: 'Audio' },
  { label: 'Forge Templates Pack', type: 'Marketplace' },
  { label: 'Guilds Weekly Summit', type: 'Community' },
];

export function HomeWidgets() {
  const [mood, setMood] = useState(moodOptions[0]);

  const timeString = useMemo(() => {
    const now = new Date();
    return formatTime(now);
  }, []);

  const dateString = useMemo(() => {
    const now = new Date();
    return formatLongDate(now);
  }, []);

  const remaining = financeSummary.budget - financeSummary.spent;
  const spendPct = Math.round((financeSummary.spent / financeSummary.budget) * 100);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <Card className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Time</p>
        <p className="text-4xl font-bold text-slate-900 dark:text-slate-50">{timeString}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">{dateString}</p>
      </Card>

      <Card className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Mood</p>
        <div className="flex flex-wrap gap-2">
          {moodOptions.map((option) => {
            const isActive = mood.label === option.label;
            return (
              <Button
                key={option.label}
                type="button"
                variant="ghost"
                size="sm"
                aria-pressed={isActive}
                onClick={() => setMood(option)}
                className={cn(
                  'rounded-full px-3 text-xs font-semibold',
                  isActive
                    ? 'bg-blue-600 text-white hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-500'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                )}
              >
                {option.label}
              </Button>
            );
          })}
        </div>
        <Badge variant={mood.color as 'default' | 'info' | 'success' | 'primary'} size="sm">
          Current: {mood.label}
        </Badge>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Finance</p>
          <Button variant="ghost" size="sm">View</Button>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          ${financeSummary.spent} / ${financeSummary.budget}
        </p>
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500" style={{ width: `${spendPct}%` }} />
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          ${remaining} remaining • ${financeSummary.savings} saved
        </p>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Trending</p>
          <Button variant="ghost" size="sm">Explore</Button>
        </div>
        <div className="space-y-2">
          {trending.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-900 dark:text-slate-50">{item.label}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{item.type}</span>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
