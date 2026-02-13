'use client';

import { Card } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';
import { Badge } from '@/components/aurora/Badge';
import clsx from 'clsx';

const stats = [
  { label: 'Active Users', value: '128,402', delta: '+6.2%', tone: 'emerald' },
  { label: 'Universe Sessions', value: '2.4M', delta: '+3.1%', tone: 'blue' },
  { label: 'Automation Runs', value: '842k', delta: '+8.9%', tone: 'violet' },
  { label: 'Revenue', value: '$1.86M', delta: '+4.6%', tone: 'amber' },
];

const systemHealth = [
  { label: 'API Latency', value: '148ms', status: 'Stable' },
  { label: 'Error Rate', value: '0.18%', status: 'Healthy' },
  { label: 'Queue Depth', value: '1,204', status: 'Normal' },
  { label: 'Uptime', value: '99.98%', status: 'Excellent' },
];

const recentEvents = [
  {
    title: 'New universe release: Automation',
    time: '2 hours ago',
    tag: 'Deploy',
  },
  {
    title: 'Security policy updated for Admins',
    time: '5 hours ago',
    tag: 'Security',
  },
  {
    title: 'Spike detected in search usage',
    time: 'Yesterday',
    tag: 'Insight',
  },
  {
    title: 'New enterprise onboarding',
    time: '2 days ago',
    tag: 'Growth',
  },
];

const universeStatus = [
  { name: 'Home', health: 'Green', users: '38k', activity: 'High' },
  { name: 'Learning', health: 'Green', users: '24k', activity: 'High' },
  { name: 'Forge', health: 'Yellow', users: '12k', activity: 'Medium' },
  { name: 'Finance', health: 'Green', users: '9k', activity: 'High' },
  { name: 'Health', health: 'Green', users: '7k', activity: 'Medium' },
  { name: 'Automation', health: 'Yellow', users: '6k', activity: 'High' },
];

const healthTone: Record<string, string> = {
  Green: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
  Yellow: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
  Red: 'bg-rose-500/15 text-rose-600 dark:text-rose-300',
};

export function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">
            Admin Command Center
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Monitor system health, universe activity, and governance controls.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary">Export Report</Button>
          <Button variant="primary">Open Governance</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5 space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {stat.label}
            </p>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                {stat.value}
              </span>
              <span
                className={clsx(
                  'text-xs font-semibold px-2 py-1 rounded-full',
                  stat.tone === 'emerald' && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
                  stat.tone === 'blue' && 'bg-blue-500/15 text-blue-600 dark:text-blue-300',
                  stat.tone === 'violet' && 'bg-violet-500/15 text-violet-600 dark:text-violet-300',
                  stat.tone === 'amber' && 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
                )}
              >
                {stat.delta}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              System Health
            </h2>
            <Badge variant="success" size="sm">Live</Badge>
          </div>
          <div className="space-y-3">
            {systemHealth.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{item.value}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Universe Status
          </h2>
          <div className="space-y-3">
            {universeStatus.map((universe) => (
              <div key={universe.name} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-50">
                    {universe.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {universe.users} active users
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={clsx('text-xs px-2 py-1 rounded-full', healthTone[universe.health])}>
                    {universe.health}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {universe.activity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentEvents.map((event) => (
              <div key={event.title} className="space-y-1">
                <p className="font-medium text-slate-900 dark:text-slate-50">
                  {event.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{event.time}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                    {event.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Governance Actions
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Manage ethical AI, privacy, and automation policies.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost">Review AI Audits</Button>
            <Button variant="secondary">Privacy Requests</Button>
            <Button variant="primary">Launch Incident Protocol</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">AI Ethics</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              12 audits pending
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Privacy</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              4 requests awaiting review
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Automation</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              2 escalations in queue
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
