'use client';

import { useMemo, useState } from 'react';
import { AuroraModal } from '@/components/aurora/Modal';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/aurora/Button';
import { useCompanion } from '@/lib/companion/companion-provider';
import { useMemory } from '@/lib/memory/memory-provider';
import { useCompanionContextEngine } from '@/lib/companion/companion-context-engine';
import { cn, formatDateTime } from '@/lib/utils';

const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) return 'Not set';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return formatDateTime(date);
};

export function CompanionPanel() {
  const { isOpen, close } = useCompanion();
  const {
    enabled,
    setEnabled,
    lastUniverse,
    lastRoute,
    lastVisitedAt,
    events,
    addNote,
    clearMemory,
  } = useMemory();
  const {
    currentUniverse,
    currentTone,
    currentScope,
    guidanceTheme,
    toneBehavior,
    scopeBehavior,
    signals,
    clearSignal,
    visitCount,
    addSignal,
  } = useCompanionContextEngine();
  const [note, setNote] = useState('');

  const recentEvents = useMemo(() => events.slice(0, 6), [events]);

  const handleAddNote = () => {
    addNote(note);
    setNote('');
  };

  return (
    <AuroraModal
      isOpen={isOpen}
      onClose={close}
      title="Companion Panel"
      description="Personal context, memory, and adaptive privacy controls."
      size="lg"
      footerContent="Memory is stored locally in this browser. Your personality adapts to each universe."
    >
      <div className="space-y-6">
        {/* Personality Status */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20 p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Aurora's Personality
              </h3>
              <Badge variant="primary" size="sm" className="bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100">
                Adaptive
              </Badge>
            </div>

            <dl className="grid gap-3 text-sm">
              <div className="flex items-start justify-between">
                <dt className="text-slate-600 dark:text-slate-400">Current Universe</dt>
                <dd className="text-right text-slate-900 dark:text-slate-100 font-medium capitalize">
                  {currentUniverse || 'Home'}
                </dd>
              </div>
              <div className="flex items-start justify-between">
                <dt className="text-slate-600 dark:text-slate-400">Tone</dt>
                <dd className="text-right text-slate-900 dark:text-slate-100 font-medium capitalize">
                  {currentTone}
                </dd>
              </div>
              <div className="flex items-start justify-between">
                <dt className="text-slate-600 dark:text-slate-400">Scope</dt>
                <dd className="text-right text-slate-900 dark:text-slate-100 font-medium capitalize">
                  {currentScope}
                </dd>
              </div>
              {guidanceTheme && (
                <div className="flex items-start justify-between">
                  <dt className="text-slate-600 dark:text-slate-400">Theme</dt>
                  <dd className="text-right text-slate-900 dark:text-slate-100 text-xs">
                    {guidanceTheme}
                  </dd>
                </div>
              )}
            </dl>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                <span className="text-blue-600 dark:text-blue-400 font-medium">Current Tone:</span> {toneBehavior.greeting}
              </p>
            </div>
          </div>
        </section>

        {/* Context Snapshot */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Context Snapshot
            </h3>
            <dl className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <dt>Universe</dt>
                <dd className="text-slate-900 dark:text-slate-100">
                  {lastUniverse ?? 'Not set'}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Route</dt>
                <dd className="text-slate-900 dark:text-slate-100">
                  {lastRoute ?? 'Not set'}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Visit Count</dt>
                <dd className="text-slate-900 dark:text-slate-100">{visitCount}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Updated</dt>
                <dd className="text-slate-900 dark:text-slate-100 text-xs">
                  {formatTimestamp(lastVisitedAt)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Memory Controls
            </h3>
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Local Memory</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    Context tracking.
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(event) => setEnabled(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    aria-label="Toggle memory storage"
                  />
                </label>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={clearMemory}
                className="w-full text-xs"
              >
                Clear memory
              </Button>
            </div>
          </div>
        </section>

        {/* Active Signals */}
        {signals.length > 0 && (
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">
              Current Signals
            </h3>
            <div className="flex flex-wrap gap-2">
              {signals.map((signal) => (
                <Badge
                  key={signal}
                  size="sm"
                  variant="primary"
                  className="gap-2 pr-2 bg-blue-100 text-blue-700 ring-0 dark:bg-blue-900/40 dark:text-blue-200"
                >
                  {signal}
                  <button
                    onClick={() => clearSignal(signal)}
                    className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-100 font-bold"
                    aria-label={`Remove ${signal} signal`}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Signals influence how Aurora adapts.
              <button
                onClick={() => addSignal('focus')}
                className="ml-1 underline hover:no-underline"
              >
                Try "focus"
              </button>
            </p>
          </section>
        )}

        {/* Quick Note */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Quick Note
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-500">Saved locally</span>
          </div>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Capture a thought for your companion"
            className={cn(
              'w-full min-h-[96px] rounded-lg border border-slate-200 dark:border-slate-800',
              'bg-white/90 dark:bg-slate-950/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100',
              'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50'
            )}
          />
          <div className="flex items-center justify-end">
            <Button variant="primary" size="sm" onClick={handleAddNote}>
              Add note
            </Button>
          </div>
        </section>

        {/* Recent Memory */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Recent Memory
          </h3>
          <div className="mt-3 space-y-3">
            {recentEvents.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No memory recorded yet.
              </p>
            )}
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-lg border border-slate-200/70 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/60 px-3 py-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {event.label}
                    </p>
                    {event.detail && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {event.detail}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AuroraModal>
  );
}
