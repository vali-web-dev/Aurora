'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';
import { AuroraShell } from '@/components/os/AuroraShell';
import {
  UniverseCard,
  RecentOrdersWidget,
  CartSummaryWidget,
  ActivityFeedWidget,
  QuickStatsWidget,
} from '@/components/home/DashboardWidgets';
import {
  CompanionWidget,
  WeatherWidget,
  NotificationsWidget,
} from '@/components/home/CompanionWidget';
import { EmptyDashboardState } from '@/components/home/EmptyDashboardState';
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
  const hasNoActivity = !isLoadingStats && !isLoadingActivity && 
    stats.posts === 0 && stats.communities === 0 && 
    stats.messages === 0 && activities.length === 0;

  const fetchData = useCallback(async () => {
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
  }, [session?.user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <AuroraShell>
        <div className="min-h-screen flex items-center justify-center">
          <div className="aurora-label animate-pulse transform-gpu text-slate-600 dark:text-slate-400">
            Loading dashboard...
          </div>
        </div>
      </AuroraShell>
    );
  }

  // Show empty state for new users
  if (hasNoActivity) {
    return (
      <AuroraShell>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <EmptyDashboardState onSampleDataCreated={() => {
              setIsLoadingStats(true);
              setIsLoadingActivity(true);
              fetchData();
            }} />
          </div>
        </div>
      </AuroraShell>
    );
  }

  return (
    <AuroraShell>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="aurora-heading-1">
                Welcome back, {session?.user?.name || 'User'}!
              </h1>
              <p className="aurora-label text-slate-600 dark:text-slate-400 mt-2">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Link href="/settings">
              <Button variant="secondary" size="sm">
                ⚙️ Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        {isLoadingStats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6 space-y-3 animate-pulse transform-gpu">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
              </Card>
            ))}
          </div>
        ) : (
          <QuickStatsWidget stats={stats} />
        )}

        {/* Universe Quick Access */}
        <div className="space-y-4">
          <h2 className="aurora-label text-2xl font-bold text-slate-900 dark:text-slate-50">
            Your Universes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <UniverseCard
              name="Entertainment"
              href="/entertainment"
              icon="🎬"
              color="from-purple-500 to-pink-500"
              description="Music, movies, shows, podcasts, and books"
            />
            <UniverseCard
              name="Commerce"
              href="/commerce"
              icon="🛍️"
              color="from-emerald-500 to-teal-500"
              description="Shop from multiple providers in one place"
            />
            <UniverseCard
              name="Social"
              href="/social"
              icon="👥"
              color="from-blue-500 to-cyan-500"
              description="Connect with friends and communities"
            />
            <UniverseCard
              name="Learning"
              href="/learning"
              icon="📚"
              color="from-amber-500 to-orange-500"
              description="Courses, tutorials, and knowledge"
            />
            <UniverseCard
              name="Create"
              href="/create"
              icon="🎨"
              color="from-rose-500 to-pink-500"
              description="Design, art, and creative tools"
            />
            <UniverseCard
              name="Productivity"
              href="/productivity"
              icon="📊"
              color="from-indigo-500 to-purple-500"
              description="Tasks, notes, and workflow management"
            />
          </div>
        </div>

        {/* Commerce & Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <CartSummaryWidget />
          </div>
          
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <RecentOrdersWidget />
          </div>
        </div>

        {/* AI Companion & Widgets Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CompanionWidget />
          </div>
          <div className="space-y-6">
            <WeatherWidget />
            <NotificationsWidget />
          </div>
        </div>

        {/* Recent Activity */}
        {isLoadingActivity ? (
          <Card className="p-6">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-4 animate-pulse transform-gpu" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 animate-pulse transform-gpu"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <ActivityFeedWidget activities={activities} />
        )}

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="aurora-label text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link
              href="/social"
              className={clsx(
                'p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700',
                'hover:border-blue-500 dark:hover:border-blue-400',
                'hover:bg-blue-50 dark:hover:bg-blue-950/20',
                'transition-all duration-200 group'
              )}
            >
              <div className="text-2xl mb-2">📝</div>
              <div className="aurora-label text-slate-900 dark:text-slate-50 mb-1">
                Create Post
              </div>
              <div className="aurora-label text-sm text-slate-600 dark:text-slate-400">
                Share with your network
              </div>
            </Link>

            <Link
              href="/guilds"
              className={clsx(
                'p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700',
                'hover:border-purple-500 dark:hover:border-purple-400',
                'hover:bg-purple-50 dark:hover:bg-purple-950/20',
                'transition-all duration-200 group'
              )}
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="aurora-label text-slate-900 dark:text-slate-50 mb-1">
                Join Community
              </div>
              <div className="aurora-label text-sm text-slate-600 dark:text-slate-400">
                Discover new groups
              </div>
            </Link>

            <Link
              href="/learning"
              className={clsx(
                'p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700',
                'hover:border-amber-500 dark:hover:border-amber-400',
                'hover:bg-amber-50 dark:hover:bg-amber-950/20',
                'transition-all duration-200 group'
              )}
            >
              <div className="text-2xl mb-2">📚</div>
              <div className="aurora-label text-slate-900 dark:text-slate-50 mb-1">
                Start Learning
              </div>
              <div className="aurora-label text-sm text-slate-600 dark:text-slate-400">
                Browse courses
              </div>
            </Link>

            <Link
              href="/commerce"
              className={clsx(
                'p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700',
                'hover:border-emerald-500 dark:hover:border-emerald-400',
                'hover:bg-emerald-50 dark:hover:bg-emerald-950/20',
                'transition-all duration-200 group'
              )}
            >
              <div className="text-2xl mb-2">🛒</div>
              <div className="aurora-label text-slate-900 dark:text-slate-50 mb-1">
                Shop Now
              </div>
              <div className="aurora-label text-sm text-slate-600 dark:text-slate-400">
                Browse products
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
    </AuroraShell>
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
