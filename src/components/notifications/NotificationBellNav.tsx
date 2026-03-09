'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { onEvent } from '@/lib/websocket-client';
import { WSEventType } from '@/lib/websocket-types';

interface NotificationBellNavProps {
  onOpenChange?: (open: boolean) => void;
  forceCloseSignal?: number;
}

export function NotificationBellNav({ onOpenChange, forceCloseSignal = 0 }: NotificationBellNavProps = {}) {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
      onOpenChange?.(isOpen);
    }, [isOpen, onOpenChange]);

    useEffect(() => {
      setIsOpen(false);
    }, [forceCloseSignal]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch initial unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications?limit=100');
        if (response.ok) {
          const data = await response.json();
          const unread = data.notifications?.filter((n: any) => !n.read).length || 0;
          setUnreadCount(unread);
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    if (session) {
      fetchUnreadCount();
    }
  }, [session]);

  // Listen for new notifications
  useEffect(() => {
    if (!session) return;

    const unsubscribe = onEvent(WSEventType.NOTIFICATION, (data: any) => {
      setNotifications((prev) => [data, ...prev].slice(0, 10)); // Keep last 10
      setUnreadCount((prev) => prev + 1);
    });

    return () => unsubscribe();
  }, [session]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <svg
          className="w-6 h-6 text-slate-700 dark:text-slate-300"
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
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && notifications.length > 0 && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
          <div className="max-h-96 overflow-y-auto">
            {notifications.slice(0, 5).map((notif) => (
              <Link key={notif.id} href={notif.link || '/notifications'}>
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                  <p className="aurora-label text-sm font-semibold text-slate-900 dark:text-slate-50 line-clamp-1">
                    {notif.title}
                  </p>
                  <p className="aurora-label text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                    {notif.message}
                  </p>
                  <p className="aurora-label text-xs text-slate-500 mt-2">{formatTime(notif.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
            <Link href="/notifications">
              <button className="aurora-label w-full text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                View all notifications
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
