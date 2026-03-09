'use client';

import { useNotifications } from '@/lib/hooks/use-realtime';
import { useSession } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';

/**
 * Notification Bell Component
 * Displays unread notifications and provides quick access
 */
export function NotificationBell() {
  const { data: session } = useSession();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useBodyScrollLock(isOpen);

  if (!session?.user) return null;

  return (
    <div className="relative" ref={menuRef}>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded">
                {unreadCount} new
              </span>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <Link key={notif.id} href={notif.link || '#'}>
                  <div
                    className={clsx(
                      'p-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer',
                      !notif.read && 'bg-blue-50 dark:bg-blue-900/20'
                    )}
                    onClick={() => {
                      if (!notif.read) markAsRead(notif.id);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Type Icon */}
                      <div className="mt-1">
                        {notif.type === 'mention' && (
                          <span className="text-lg">@</span>
                        )}
                        {notif.type === 'reaction' && (
                          <span className="text-lg">👍</span>
                        )}
                        {notif.type === 'comment' && (
                          <span className="text-lg">💬</span>
                        )}
                        {notif.type === 'message' && (
                          <span className="text-lg">✉️</span>
                        )}
                        {notif.type === 'system' && (
                          <span className="text-lg">ℹ️</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {notif.title}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          {notif.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {formatTime(new Date(notif.createdAt))}
                        </p>
                      </div>

                      {/* Unread Indicator */}
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <Link href="/notifications">
              <div className="p-3 text-center text-sm text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                View all notifications
              </div>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Presence Indicator Component
 * Shows online status dot
 */
export function PresenceIndicator({
  userId,
  size = 'md',
}: {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [isOnline, setIsOnline] = useState(false);

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div
      className={clsx(
        sizeClasses[size],
        'rounded-full',
        isOnline ? 'bg-green-500' : 'bg-gray-400',
        'flex-shrink-0'
      )}
      title={isOnline ? 'Online' : 'Offline'}
    ></div>
  );
}

/**
 * Typing Indicator Component
 * Shows dots animation while someone is typing
 */
export function TypingIndicator({ users }: { users: string[] }) {
  if (users.length === 0) return null;

  const userNames = users.slice(0, 3).join(', ');
  const extra = users.length > 3 ? ` +${users.length - 3} more` : '';

  return (
    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
      <span>{userNames}{extra} is typing</span>
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
    </div>
  );
}

/**
 * Helper: Format time for notifications
 */
function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // Less than a minute
  if (diff < 60000) return 'just now';

  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // Less than a week
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }

  // Format as date
  return date.toLocaleDateString();
}
