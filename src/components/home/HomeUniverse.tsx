'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Card, CardTitle } from '@/components/aurora/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/aurora/Badge';
import { StatCard } from '@/components/aurora/StatCard';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { FeatureGrid } from '@/components/home/FeatureGrid';
import { TrustSection } from '@/components/home/TrustSection';
import { Hero } from '@/components/home/Hero';
import { HomeWidgets } from '@/components/home/HomeWidgets';
import { HomePreviews } from '@/components/home/HomePreviews';
import { HomeLists } from '@/components/home/HomeLists';
import { HomeUpgrades } from '@/components/home/HomeUpgrades';
import { formatDateTime } from '@/lib/utils';
import { InlineNotice } from '@/components/ui/InlineNotice';
import {
  AuroraDataService,
  mockCourseProgress,
  type Task,
  type Course,
  type Realm,
} from '@/data/types';
import { useRouter } from 'next/navigation';
import { expandableNavigation } from '@/lib/expandable-navigation';
import { PageIcon, getPageIconColor, resolvePageIconName } from '@/components/aurora/PageIcons';
import Link from 'next/link';

const tasks = AuroraDataService.getTasks();
const notes = AuroraDataService.getNotes();
const events = AuroraDataService.getCalendarEvents();
const realms = AuroraDataService.getRealms();
const courses = AuroraDataService.getCourses();

const progressByCourse = new Map(
  mockCourseProgress.map((entry) => [entry.courseId, entry.progress])
);

const topTasks = tasks.filter((task) => task.status !== 'done').slice(0, 3);
const upcomingEvents = events.slice(0, 3);
const activeCourses = courses
  .map((course) => ({
    course,
    progress: progressByCourse.get(course.id) ?? 0,
  }))
  .filter((entry) => entry.progress > 0)
  .slice(0, 3);

const quickActions = [
  { label: 'Start Focus Realm', href: '/realms' },
  { label: 'Open Create', href: '/create' },
  { label: 'New Note', href: '/productivity' },
  { label: 'Plan the Day', href: '/productivity' },
];

const dailyBrief = {
  greeting: 'Good evening, Aurora Founder',
  summary: 'You have 3 focus tasks, 2 events, and 1 active learning path.',
  highlight: 'Creation Realm is your most active space this week.',
};

export function HomeUniverse() {
  const router = useRouter();
  const [notice, setNotice] = useState<{ message: string; tone: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const primaryPortals = expandableNavigation.filter((item) => item.group === 'Primary');
  const orbitPrimary = primaryPortals.slice(0, 10);
  const orbitSecondary = primaryPortals.flatMap((item) => item.children ?? []).slice(0, 16);

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
    }, 2200);
  };

  const handleNavigate = (path: string, label: string) => {
    pushNotice(`Opening ${label}...`, 'info');
    window.setTimeout(() => router.push(path), 200);
  };

  const handleOrbitalClick = (item: { href: string; label: string }) => {
    handleNavigate(item.href, item.label);
  };

  return (
    <Surface className="space-y-16">
      <Hero />

      <SurfaceHeader
        title="Home Universe"
        description={dailyBrief.summary}
        actions={
          <Button variant="primary" onClick={() => handleNavigate('/dashboard', 'Dashboard')}>
            Open Dashboard
          </Button>
        }
      />

      {notice && (
        <InlineNotice message={notice.message} tone={notice.tone} />
      )}

      <SurfaceSection title="Daily Brief">
        <div>
          <p className="aurora-label text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
            {dailyBrief.greeting}
          </p>
        </div>
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-900">
          <Link href="/realms" className="block space-y-2 rounded-lg p-1 -m-1 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
            <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">Daily Brief</p>
            <p className="aurora-label text-lg font-semibold text-slate-900 dark:text-slate-50">
              {dailyBrief.highlight}
            </p>
          </Link>
        </Card>
      </SurfaceSection>

      <HomeWidgets />

      <HomePreviews />

      <HomeLists />

      <HomeUpgrades />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/productivity" className="block">
          <StatCard label="Focus Tasks" value={topTasks.length} helper="Active priorities" />
        </Link>
        <Link href="/productivity/calendar" className="block">
          <StatCard label="Upcoming Events" value={upcomingEvents.length} helper="Next 3" />
        </Link>
        <Link href="/learning" className="block">
          <StatCard label="Active Courses" value={activeCourses.length} helper="In progress" />
        </Link>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-8">
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>Quick Actions</CardTitle>
              <Button variant="ghost" size="sm">Customize</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="list" aria-label="Quick actions">
              {quickActions.map((action) => {
                const iconName = resolvePageIconName(action.label, action.href);
                return (
                <button
                  key={action.label}
                  type="button"
                  role="listitem"
                  onClick={() => handleNavigate(action.href, action.label)}
                  className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={getPageIconColor(iconName)}>
                      <PageIcon pageName={iconName} className="w-4 h-4" />
                    </span>
                    <div className="aurora-label text-sm text-slate-900 dark:text-slate-50">
                      {action.label}
                    </div>
                  </div>
                  <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">Open {action.label}</p>
                </button>
                );
              })}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>Priority Tasks</CardTitle>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleNavigate('/productivity', 'Priority Board')}
              >
                View Board
              </Button>
            </div>
            <div className="space-y-3" role="list" aria-label="Priority tasks">
              {topTasks.map((task) => (
                <Link key={task.id} href="/productivity" role="listitem" className="block p-4 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="aurora-label text-slate-900 dark:text-slate-50">{task.title}</p>
                    <Badge variant={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'default'} size="sm">
                      {task.priority}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">{task.description}</p>
                  )}
                </Link>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>Learning Progress</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate('/learning', 'Learning')}
              >
                Open Learning
              </Button>
            </div>
            <div className="space-y-3" role="list" aria-label="Learning progress">
              {activeCourses.map(({ course, progress }) => (
                <Link key={course.id} href="/learning" role="listitem" className="block p-4 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <p className="aurora-label text-slate-900 dark:text-slate-50">{course.title}</p>
                  <div className="aurora-label flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>{progress}% complete</span>
                    <span>{course.durationHours}h</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600" style={{ width: `${progress}%` }} />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-4">
            <CardTitle>Upcoming Events</CardTitle>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <Link key={event.id} href="/productivity/calendar" className="block p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <p className="aurora-label text-slate-900 dark:text-slate-50">{event.title}</p>
                  <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                    {formatDateTime(event.startsAt)} • {event.durationMinutes} min
                  </p>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <CardTitle>Realm Highlights</CardTitle>
            <div className="space-y-3">
              {realms.slice(0, 3).map((realm) => (
                <div key={realm.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                  <div>
                    <p className="aurora-label text-slate-900 dark:text-slate-50">{realm.name}</p>
                    <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">{realm.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate('/realms', 'Realms')}
                  >
                    Enter
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <CardTitle>Notes</CardTitle>
            <div className="space-y-3">
              {notes.slice(0, 3).map((note) => (
                <Link key={note.id} href="/productivity/notes" className="block p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <p className="aurora-label text-slate-900 dark:text-slate-50">{note.title}</p>
                  <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">{note.body}</p>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <FeatureGrid />
      <TrustSection />

      <style jsx>{`
      `}</style>
    </Surface>
  );
}
