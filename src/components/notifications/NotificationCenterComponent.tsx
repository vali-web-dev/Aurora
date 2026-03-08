'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { InlineNotice } from '@/components/ui/InlineNotice';
import { onEvent } from '@/lib/websocket-client';
import { WSEventType } from '@/lib/websocket-types';

interface Notification {
  id: string | number;
  userId?: string;
  type: 'mention' | 'reaction' | 'comment' | 'message' | 'system' | 'follow';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date | string;
  data?: Record<string, any>;
}

type FilterType = 'all' | 'unread' | 'mention' | 'reaction' | 'comment' | 'message' | 'system' | 'follow';

const notificationTypeConfig = {
  mention: { marker: 'M', label: 'Mentions', color: 'bg-blue-100 dark:bg-blue-900/30' },
  reaction: { marker: 'R', label: 'Reactions', color: 'bg-yellow-100 dark:bg-yellow-900/30' },
  comment: { marker: 'C', label: 'Comments', color: 'bg-purple-100 dark:bg-purple-900/30' },
  message: { marker: 'Msg', label: 'Messages', color: 'bg-green-100 dark:bg-green-900/30' },
  system: { marker: 'Sys', label: 'System', color: 'bg-slate-100 dark:bg-slate-900/30' },
  follow: { marker: 'F', label: 'Follows', color: 'bg-pink-100 dark:bg-pink-900/30' },
};

export function NotificationCenterComponent() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [notice, setNotice] = useState<{ message: string; tone: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications?limit=100');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchNotifications();
    }
  }, [session]);

  // Listen for real-time notifications
  useEffect(() => {
    if (!session) return;

    const unsubscribe = onEvent(WSEventType.NOTIFICATION, (data: any) => {
      setNotifications((prev) => [data, ...prev]);
    });

    return () => unsubscribe();
  }, [session]);

  // Cleanup notice timer
  useEffect(() => {
    return () => {
      if (noticeTimerRef.current !== null) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const pushNotice = (message: string, tone: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setNotice({ message, tone });
    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setNotice(null);
    }, 2600);
  };

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let items = notifications;

    if (filter === 'unread') {
      items = items.filter((n) => !n.read);
    } else if (filter !== 'all') {
      items = items.filter((n) => n.type === filter);
    }

    return items;
  }, [notifications, filter]);

  // Count unread
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  // Handle mark as read
  const handleMarkAsRead = async (notificationId: string | number, isRead: boolean) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: !isRead }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: !isRead } : n))
        );
        pushNotice(isRead ? 'Marked as unread' : 'Marked as read', 'success');
      }
    } catch (error) {
      console.error('Error updating notification:', error);
      pushNotice('Failed to update notification', 'error');
    }
  };

  // Handle delete
  const handleDelete = async (notificationId: string | number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        pushNotice('Notification deleted', 'success');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      pushNotice('Failed to delete notification', 'error');
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        pushNotice('All notifications marked as read', 'success');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      pushNotice('Failed to mark all as read', 'error');
    }
  };

  // Handle clear all
  const handleClearAll = async () => {
    if (!window.confirm('Delete all notifications? This cannot be undone.')) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications([]);
        pushNotice('All notifications cleared', 'success');
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      pushNotice('Failed to clear notifications', 'error');
    }
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <Surface>
      <SurfaceHeader
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        actions={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="secondary" size="sm" onClick={handleMarkAllAsRead}>
                Mark all as read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearAll}>
                Clear all
              </Button>
            )}
          </div>
        }
      />

      {notice && (
        <SurfaceSection title="Status Notice">
          <InlineNotice tone={notice.tone} message={notice.message} />
        </SurfaceSection>
      )}

      {/* Filters */}
      <SurfaceSection title="Filters">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'unread', 'mention', 'reaction', 'comment', 'message', 'system', 'follow'] as FilterType[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`aurora-label px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === f
                    ? 'aurora-label bg-blue-500 text-white'
                    : 'aurora-label bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {f === 'all'
                  ? 'All'
                  : f === 'unread'
                    ? 'Unread'
                    : `${notificationTypeConfig[f as keyof typeof notificationTypeConfig]?.label || f}`}
                <span className="ml-1 inline-flex items-center rounded-full border border-current/30 px-1.5 py-0.5 text-[10px] leading-none" aria-hidden="true">
                  {f === 'all' ? 'ALL' : f === 'unread' ? 'NEW' : notificationTypeConfig[f as keyof typeof notificationTypeConfig]?.marker || 'N'}
                </span>
              </button>
            )
          )}
        </div>
      </SurfaceSection>

      {/* Notifications List */}
      <SurfaceSection title="Notification Feed" className="space-y-2">
        {isLoading ? (
          <p className="aurora-label text-sm text-slate-500 text-center py-8">Loading notifications...</p>
        ) : filteredNotifications.length === 0 ? (
          <p className="aurora-label text-sm text-slate-500 text-center py-8">
            {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
          </p>
        ) : (
          <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
            {filteredNotifications.map((notification) => {
              const typeConfig = notificationTypeConfig[notification.type];
              return (
                <div
                  key={notification.id}
                  className={`aurora-label flex gap-4 p-4 rounded-lg border transition-colors ${
                    notification.read
                      ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'
                      : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                  } ${notification.link ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800' : ''}`}
                  onClick={() => {
                    if (notification.link) {
                      window.location.href = notification.link;
                    }
                  }}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${typeConfig?.color}`}>
                      <span className="aurora-label text-xs font-semibold" aria-hidden="true">{typeConfig?.marker || 'N'}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="aurora-label text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="aurora-label text-sm text-slate-700 dark:text-slate-300 break-words">
                      {notification.message}
                    </p>
                    <p className="aurora-label text-xs text-slate-500 mt-2">{formatTime(notification.createdAt)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id, notification.read);
                      }}
                      className="aurora-label p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title={notification.read ? 'Mark as unread' : 'Mark as read'}
                    >
                      {notification.read ? 'Read' : 'Mark'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="aurora-label p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400"
                      title="Delete notification"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SurfaceSection>

      {/* Empty State Actions */}
      {filteredNotifications.length === 0 && !isLoading && (
        <SurfaceSection title="Empty State" className="text-center py-8">
          <p className="aurora-label text-sm text-slate-600 dark:text-slate-400 mb-4">
            {filter === 'all' ? "You're all caught up!" : `No notifications in this category`}
          </p>
          {filter !== 'all' && (
            <Button variant="secondary" size="sm" onClick={() => setFilter('all')}>
              View all notifications
            </Button>
          )}
        </SurfaceSection>
      )}
    </Surface>
  );
}
