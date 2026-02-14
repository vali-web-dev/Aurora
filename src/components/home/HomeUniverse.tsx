'use client';

import { Card } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';
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
import {
  AuroraDataService,
  mockCourseProgress,
  type Task,
  type Course,
  type Realm,
} from '@/data/types';

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
  { label: 'Start Focus Realm', icon: 'target' },
  { label: 'Open Forge', icon: 'forge' },
  { label: 'New Note', icon: 'note' },
  { label: 'Plan the Day', icon: 'calendar' },
];

const dailyBrief = {
  greeting: 'Good evening, Aurora Founder',
  summary: 'You have 3 focus tasks, 2 events, and 1 active learning path.',
  highlight: 'Creation Realm is your most active space this week.',
};

const iconMap: Record<string, string> = {
  target: 'Target',
  forge: 'Forge',
  note: 'Note',
  calendar: 'Plan',
};

export function HomeUniverse() {
  return (
    <Surface className="space-y-16">
      <Hero />

      <SurfaceHeader
        title="Home Universe"
        description={dailyBrief.summary}
        actions={<Button variant="primary">Open Dashboard</Button>}
      />

      <SurfaceSection title="Daily Brief">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
            {dailyBrief.greeting}
          </p>
        </div>
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-900">
          <div className="space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">Daily Brief</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {dailyBrief.highlight}
            </p>
          </div>
        </Card>
      </SurfaceSection>

      <HomeWidgets />

      <HomePreviews />

      <HomeLists />

      <HomeUpgrades />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Focus Tasks" value={topTasks.length} helper="Active priorities" />
        <StatCard label="Upcoming Events" value={upcomingEvents.length} helper="Next 3" />
        <StatCard label="Active Courses" value={activeCourses.length} helper="In progress" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-8">
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Quick Actions</h3>
              <Button variant="ghost" size="sm">Customize</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="list" aria-label="Quick actions">
              {quickActions.map((action) => (
                <div key={action.label} role="listitem" className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-2">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {iconMap[action.icon]}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{action.label}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Priority Tasks</h3>
              <Button variant="secondary" size="sm">View Board</Button>
            </div>
            <div className="space-y-3" role="list" aria-label="Priority tasks">
              {topTasks.map((task) => (
                <div key={task.id} role="listitem" className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 dark:text-slate-50">{task.title}</p>
                    <Badge variant={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'default'} size="sm">
                      {task.priority}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400">{task.description}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Learning Progress</h3>
              <Button variant="ghost" size="sm">Open Learning</Button>
            </div>
            <div className="space-y-3" role="list" aria-label="Learning progress">
              {activeCourses.map(({ course, progress }) => (
                <div key={course.id} role="listitem" className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-2">
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{course.title}</p>
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>{progress}% complete</span>
                    <span>{course.durationHours}h</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-css-tags */}
                    <div className="h-full bg-blue-600" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Upcoming Events</h3>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{event.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {event.startsAt.toLocaleString()} • {event.durationMinutes} min
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Realm Highlights</h3>
            <div className="space-y-3">
              {realms.slice(0, 3).map((realm) => (
                <div key={realm.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-50">{realm.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{realm.description}</p>
                  </div>
                  <Button variant="ghost" size="sm">Enter</Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Notes</h3>
            <div className="space-y-3">
              {notes.slice(0, 3).map((note) => (
                <div key={note.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{note.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{note.body}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <FeatureGrid />
      <TrustSection />
    </Surface>
  );
}
