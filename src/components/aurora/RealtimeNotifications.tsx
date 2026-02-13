'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

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
    }, 18000);

    return () => clearInterval(interval);
  }, []);

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

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const toneClass = (tone: LiveNotification['tone']) =>
    clsx(
      'text-xs px-2 py-0.5 rounded-full',
      tone === 'success' && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
      tone === 'info' && 'bg-blue-500/15 text-blue-600 dark:text-blue-300',
      tone === 'warning' && 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
    );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => {
          setIsOpen(!isOpen);
          setUnreadCount(0);
        }}
        className={clsx(
          'relative w-10 h-10 rounded-lg flex items-center justify-center',
          'text-slate-600 dark:text-slate-300',
          'bg-slate-100/70 dark:bg-slate-900/60',
          'border border-slate-200 dark:border-slate-800',
          'hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
        )}
        aria-label="Open live notifications"
      >
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          className={clsx(
            'absolute right-0 top-full mt-3 w-80 rounded-xl',
            'bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl',
            'border border-slate-200 dark:border-slate-800',
            'shadow-2xl z-50 overflow-hidden',
            'animate-slide-in-down duration-300'
          )}
        >
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Live Updates
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">Realtime</span>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((item) => (
              <div
                key={item.id}
                className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900 dark:text-slate-50">
                    {item.title}
                  </p>
                  <span className={toneClass(item.tone)}>{item.tone}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {item.detail}
                </p>
                <p className="text-[11px] text-slate-400 mt-2">{item.time}</p>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            Last sync: just now
          </div>
        </div>
      )}
    </div>
  );
}
