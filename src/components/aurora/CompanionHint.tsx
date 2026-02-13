'use client';

import { useEffect, useState } from 'react';
import { useCompanionContextEngine } from '@/lib/companion/companion-context-engine';
import { cn } from '@/lib/utils';

/**
 * CompanionHint
 * Renders subtle, context-aware hints based on personality and scope
 * Only shows when suggestions are enabled and tone suggests it's appropriate
 */
export function CompanionHint() {
  const { canShowSuggestion, currentTone, guidanceTheme, toneBehavior } =
    useCompanionContextEngine();
  const [isVisible, setIsVisible] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    if (!canShowSuggestion() || !guidanceTheme) {
      setIsVisible(false);
      return;
    }

    // Stagger appearance for smooth intro
    const timer = setTimeout(() => setIsVisible(true), 800);
    return () => clearTimeout(timer);
  }, [canShowSuggestion, guidanceTheme]);

  useEffect(() => {
    if (!guidanceTheme) return;
    setHint(guidanceTheme);
  }, [guidanceTheme]);

  if (!isVisible || !hint) return null;

  const hintColor = {
    mentor: 'from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-100',
    strategist:
      'from-slate-50 to-slate-100/50 dark:from-slate-950/40 dark:to-slate-900/20 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100',
    explorer:
      'from-purple-50 to-purple-100/50 dark:from-purple-950/40 dark:to-purple-900/20 border-purple-200 dark:border-purple-900 text-purple-900 dark:text-purple-100',
    analyst:
      'from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-100',
    guardian:
      'from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-100',
  };

  const iconEmoji = {
    mentor: '✨',
    strategist: '🎯',
    explorer: '🔍',
    analyst: '📊',
    guardian: '🛡️',
  };

  return (
    <div
      className={cn(
        'fixed bottom-24 left-4 md:left-6 max-w-xs rounded-lg border',
        'bg-gradient-to-br p-3 shadow-lg',
        'animate-slide-in-up duration-500',
        'text-sm font-medium',
        hintColor[currentTone]
      )}
      role="complementary"
      aria-label={`Companion hint: ${hint}`}
    >
      <div className="flex gap-2 items-start">
        <span className="text-lg flex-shrink-0">{iconEmoji[currentTone]}</span>
        <div>
          <p className="text-xs opacity-75 mb-1 capitalize">
            {toneBehavior.greeting.slice(0, 20)}...
          </p>
          <p className="text-sm font-medium">{hint}</p>
        </div>
      </div>
    </div>
  );
}
