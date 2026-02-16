'use client';

import { useEffect, useState } from 'react';
import { useCompanionContextEngine } from '@/lib/companion/companion-context-engine';
import { cn } from '@/lib/utils';
import clsx from 'clsx';

/**
 * CompanionHint
 * Renders subtle, context-aware hints based on personality and scope
 * Only shows when suggestions are enabled and tone suggests it's appropriate
 * User can dismiss the hint
 */
export function CompanionHint() {
  const { canShowSuggestion, currentTone, guidanceTheme, toneBehavior } =
    useCompanionContextEngine();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    if (!canShowSuggestion() || !guidanceTheme || isDismissed) {
      setIsVisible(false);
      return;
    }

    // Stagger appearance for smooth intro
    const timer = setTimeout(() => setIsVisible(true), 800);
    return () => clearTimeout(timer);
  }, [canShowSuggestion, guidanceTheme, isDismissed]);

  useEffect(() => {
    if (!guidanceTheme) return;
    setHint(guidanceTheme);
  }, [guidanceTheme]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (!isVisible || !hint || isDismissed) return null;

  const hintColor = {
    mentor: 'aurora-label from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-100',
    strategist:
      'aurora-label from-slate-50 to-slate-100/50 dark:from-slate-950/40 dark:to-slate-900/20 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100',
    explorer:
      'aurora-label from-purple-50 to-purple-100/50 dark:from-purple-950/40 dark:to-purple-900/20 border-purple-200 dark:border-purple-900 text-purple-900 dark:text-purple-100',
    analyst:
      'aurora-label from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-100',
    guardian:
      'aurora-label from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-100',
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
        'aurora-label animate-slide-in-up duration-500',
        'text-sm font-medium',
        'group',
        hintColor[currentTone]
      )}
      role="complementary"
      aria-label={`Companion hint: ${hint}`}
    >
      <div className="flex gap-2 items-start">
        <span className="aurora-label text-lg flex-shrink-0">{iconEmoji[currentTone]}</span>
        <div className="flex-1">
          <p className="aurora-label text-xs opacity-75 mb-1 capitalize">
            {toneBehavior.greeting.slice(0, 20)}...
          </p>
          <p className="aurora-label text-sm font-medium">{hint}</p>
        </div>
        <button
          onClick={handleDismiss}
          className={clsx(
            'flex-shrink-0 w-6 h-6 rounded',
            'flex items-center justify-center',
            'opacity-0 group-hover:opacity-100',
            'hover:bg-black/5 dark:hover:bg-white/10',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-current focus:opacity-100'
          )}
          aria-label="Dismiss hint"
          title="Dismiss (won't show again this session)"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
