'use client';

import { useEffect, useId, useRef, useState } from 'react';
import clsx from 'clsx';
import { Badge } from '@/components/aurora/Badge';
import { useRealtime } from '@/lib/realtime/realtime-provider';
import { announce } from '@/lib/a11y/announcer';

interface LiveNotification {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: 'info' | 'success' | 'warning';
}

const seedNotifications: LiveNotification[] = [
  {
    id: 'n-1',
    title: 'Automation flow completed',
    detail: 'Nightly sync finished with 98.6% success.',
    time: 'Just now',
    tone: 'success',
  },
  {
    id: 'n-2',
    title: 'Search usage spike',
    detail: 'Global search up 12% in the last hour.',
    time: '5 min ago',
    tone: 'info',
  },
  {
    id: 'n-3',
    title: 'Finance alert',
    detail: 'Budget threshold reached in 2 universes.',
    time: '12 min ago',
    tone: 'warning',
  },
];

const liveFeed: Omit<LiveNotification, 'id' | 'time'>[] = [
  { title: 'Security scan complete', detail: 'No critical issues found.', tone: 'success' },
  { title: 'New AI policy applied', detail: 'Ethics guardrails updated.', tone: 'info' },
  { title: 'Latency alert resolved', detail: 'API latency back to 140ms.', tone: 'success' },
  { title: 'User growth surge', detail: 'New sessions up 7.4%.', tone: 'info' },
  { title: 'Moderation queue', detail: '3 items need review.', tone: 'warning' },
];

export function RealtimeNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(seedNotifications);
  const [unreadCount, setUnreadCount] = useState(2);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { addToast } = useRealtime();
  const panelId = useId();

  useEffect(() => {
    const interval = setInterval(() => {
      const next = liveFeed[Math.floor(Math.random() * liveFeed.length)];
      const newItem: LiveNotification = {
        id: `n-${Date.now()}`,
        title: next.title,
        detail: next.detail,
        time: 'Just now',
        tone: next.tone,
      };
      setNotifications((prev) => [newItem, ...prev].slice(0, 6));
      setUnreadCount((prev) => Math.min(prev + 1, 9));
      addToast({
        title: next.title,
        detail: next.detail,
        tone: next.tone,
      });
    }, 18000);

    return () => clearInterval(interval);
  }, [addToast]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    announce('Live updates opened');
    return () => announce('Live updates closed');
  }, [isOpen]);

  const toneVariant = (tone: LiveNotification['tone']) => {
    if (tone === 'success') return 'success';
    if (tone === 'warning') return 'warning';
    return 'info';
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => {
          setIsOpen(!isOpen);
          setUnreadCount(0);
        }}
        className={clsx(
          'aurora-label relative w-10 h-10 rounded-lg flex items-center justify-center',
          'aurora-label text-slate-600 dark:text-slate-300',
          'bg-slate-100/70 dark:bg-slate-900/60',
          'border border-slate-200 dark:border-slate-800',
          'hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
        )}
        aria-label="Open live notifications"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span className="aurora-label text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="aurora-label absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          id={panelId}
          role="region"
          aria-label="Live notifications"
          className={clsx(
            'aurora-menu-panel aurora-menu-panel--clear fixed right-0 top-[80px]',
            'w-full sm:w-80 max-w-md sm:max-w-none',
            'sm:rounded-xl rounded-none',
            'border-t sm:border border-slate-200 dark:border-slate-800',
            'shadow-2xl z-[9999] overflow-hidden',
            'animate-slide-in-down duration-300',
            'max-h-[80vh] flex flex-col'
          )}
        >
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="aurora-label text-sm font-semibold text-slate-900 dark:text-slate-50">
                Live Updates
              </h3>
              <span className="aurora-label text-xs text-slate-500 dark:text-slate-400">Realtime</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={clsx(
                'flex-shrink-0 w-7 h-7 rounded-lg',
                'flex items-center justify-center',
                'aurora-label text-slate-400 hover:text-slate-600 dark:hover:text-slate-300',
                'hover:bg-slate-100 dark:hover:bg-slate-800',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500'
              )}
              aria-label="Close notifications"
              title="Close (Esc)"
            >
              <svg
                className="w-4 h-4"
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
          <div className="flex-1 overflow-y-auto" aria-live="polite" aria-relevant="additions text">
            {notifications.map((item) => (
              <div
                key={item.id}
                className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="aurora-label font-medium text-slate-900 dark:text-slate-50">
                        {item.title}
                      </p>
                      <Badge size="sm" variant={toneVariant(item.tone)} className="capitalize">
                        {item.tone}
                      </Badge>
                    </div>
                    <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">
                      {item.detail}
                    </p>
                    <p className="aurora-label text-[11px] text-slate-400 mt-2">{item.time}</p>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications((prev) => prev.filter((n) => n.id !== item.id))
                    }
                    className={clsx(
                      'flex-shrink-0 w-6 h-6 rounded',
                      'flex items-center justify-center',
                      'aurora-label text-slate-300 hover:text-slate-500 dark:hover:text-slate-300',
                      'hover:bg-slate-100 dark:hover:bg-slate-800',
                      'transition-all duration-200 opacity-0 group-hover:opacity-100',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500'
                    )}
                    aria-label="Dismiss notification"
                    title="Dismiss"
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
            ))}
          </div>
          <div className="aurora-label px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            Last sync: just now
          </div>
        </div>
      )}
    </div>
  );
}
