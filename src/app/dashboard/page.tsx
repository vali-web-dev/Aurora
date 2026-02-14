'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';
import Link from 'next/link';
import clsx from 'clsx';

interface Activity {
  id: string;
  type: 'post' | 'community_join' | 'message';
  title: string;
  description: string;
  timestamp: Date;
  universe?: string;
  communityId?: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({
    posts: 0,
    communities: 0,
    messages: 0,
    connections: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  const isLoading = status === 'loading';

  useEffect(() => {
    // Fetch user stats
    async function fetchStats() {
      try {
        const response = await fetch('/api/users/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    }

    // Fetch user activity
    async function fetchActivity() {
      try {
        const response = await fetch('/api/users/activity');
        if (response.ok) {
          const data = await response.json();
          setActivities(data.activities.map((a: any) => ({
            ...a,
            timestamp: new Date(a.timestamp),
          })));
        }
      } catch (error) {
        console.error('Failed to fetch activity:', error);
      } finally {
        setIsLoadingActivity(false);
      }
    }

    if (session?.user) {
      fetchStats();
      fetchActivity();
    }
  }, [session]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-600 dark:text-slate-400">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Welcome back, {session?.user?.name || 'User'}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Your personal Aurora dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 space-y-2">
            <div className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Posts
            </div>
            {isLoadingStats ? (
              <div className="h-10 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            ) : (
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                {stats.posts}
              </div>
            )}
            <Link
              href="/social"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all →
            </Link>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Communities
            </div>
            {isLoadingStats ? (
              <div className="h-10 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            ) : (
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                {stats.communities}
              </div>
            )}
            <Link
              href="/guilds"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Explore →
            </Link>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Messages
            </div>
            {isLoadingStats ? (
              <div className="h-10 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            ) : (
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                {stats.messages}
              </div>
            )}
            <Link
              href="/guilds"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Open chats →
            </Link>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Connections
            </div>
            {isLoadingStats ? (
              <div className="h-10 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            ) : (
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                {stats.connections}
              </div>
            )}
            <Link
              href="/social"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              See network →
            </Link>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/social"
              className={clsx(
                'p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700',
                'hover:border-blue-500 dark:hover:border-blue-400',
                'hover:bg-blue-50 dark:hover:bg-blue-950/20',
                'transition-all duration-200 group'
              )}
            >
              <div className="font-semibold text-slate-900 dark:text-slate-50 mb-1">
                Create Post
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Share something with your network
              </div>
            </Link>

            <Link
              href="/guilds"
              className={clsx(
                'p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700',
                'hover:border-blue-500 dark:hover:border-blue-400',
                'hover:bg-blue-50 dark:hover:bg-blue-950/20',
                'transition-all duration-200 group'
              )}
            >
              <div className="font-semibold text-slate-900 dark:text-slate-50 mb-1">
                Join Community
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Discover new communities
              </div>
            </Link>

            <Link
              href="/learning"
              className={clsx(
                'p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700',
                'hover:border-blue-500 dark:hover:border-blue-400',
                'hover:bg-blue-50 dark:hover:bg-blue-950/20',
                'transition-all duration-200 group'
              )}
            >
              <div className="font-semibold text-slate-900 dark:text-slate-50 mb-1">
                Start Learning
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Browse courses and lessons
              </div>
            </Link>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            Recent Activity
          </h2>
          {isLoadingActivity ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 animate-pulse"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400">
              No recent activity. Start exploring Aurora!
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => {
                const colors = {
                  post: 'bg-blue-500',
                  community_join: 'bg-purple-500',
                  message: 'bg-green-500',
                };
                const icons = {
                  post: 'P',
                  community_join: 'C',
                  message: 'M',
                };
                const color = colors[activity.type] || 'bg-slate-500';
                const icon = icons[activity.type] || '?';
                
                const timeAgo = formatTimeAgo(activity.timestamp);

                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                  >
                    <div
                      className={clsx(
                        'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold',
                        color
                      )}
                    >
                      {icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                        {activity.title}
                      </div>
                      {activity.description && (
                        <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                          {activity.description}
                        </div>
                      )}
                      <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        {timeAgo}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString();
}
