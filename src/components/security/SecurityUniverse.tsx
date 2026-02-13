'use client';

import { Card } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';
import { Badge } from '@/components/aurora/Badge';
import { StatCard } from '@/components/aurora/StatCard';
import { AuroraDataService } from '@/data/types';

const devices = AuroraDataService.getDevices();
const sessions = AuroraDataService.getSecuritySessions();
const events = AuroraDataService.getSecurityEvents();
const policies = AuroraDataService.getSecurityPolicies();

const statusVariant = (status: string) => {
  switch (status) {
    case 'trusted':
      return 'success';
    case 'new':
      return 'warning';
    case 'revoked':
      return 'error';
    default:
      return 'default';
  }
};

const severityVariant = (severity: string) => {
  switch (severity) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    default:
      return 'default';
  }
};

export function SecurityUniverse() {
  const activeSessions = sessions.filter((session) => session.status === 'active').length;

  return (
    <div className="space-y-8 py-8">
      <div className="space-y-3">
        <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-50">
          Security Universe
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl">
          Safety, encryption, and transparency across every device and session.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Trusted Devices" value={devices.filter((d) => d.status === 'trusted').length} />
        <StatCard label="Active Sessions" value={activeSessions} />
        <StatCard label="Security Events" value={events.length} />
      </div>

      <Card className="bg-gradient-to-r from-slate-50 to-emerald-50 dark:from-slate-900 dark:to-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Encryption</p>
            <p className="text-xl font-semibold text-slate-900 dark:text-slate-50">End-to-end active</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">All sessions encrypted • Zero-trust enforced</p>
          </div>
          <Badge size="sm" variant="success">Secure</Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-8">
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Devices</h2>
              <Button variant="secondary" size="sm">Manage</Button>
            </div>
            <div className="space-y-3">
              {devices.map((device) => (
                <div key={device.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 dark:text-slate-50">{device.name}</p>
                    <Badge size="sm" variant={statusVariant(device.status) as 'default' | 'success' | 'warning' | 'error'}>
                      {device.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {device.location} • Last active {device.lastActiveAt.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Active Sessions</h2>
              <Button variant="ghost" size="sm">Review</Button>
            </div>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 dark:text-slate-50">{session.ipAddress}</p>
                    <Badge size="sm" variant={session.status === 'active' ? 'success' : 'default'}>
                      {session.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Device {session.deviceId} • Started {session.startedAt.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Security Events</h2>
              <Button variant="ghost" size="sm">View Log</Button>
            </div>
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 dark:text-slate-50">{event.type.toUpperCase()}</p>
                    <Badge size="sm" variant={severityVariant(event.severity) as 'default' | 'warning' | 'error'}>
                      {event.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {event.description}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    {event.createdAt.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Policies</h2>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
            <div className="space-y-3">
              {policies.map((policy) => (
                <div key={policy.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 dark:text-slate-50">{policy.title}</p>
                    <Badge size="sm" variant={policy.status === 'enabled' ? 'success' : 'default'}>
                      {policy.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Updated {policy.lastUpdated.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Security Actions</h2>
            <div className="space-y-3">
              <Button variant="primary">Enable 2FA</Button>
              <Button variant="secondary">Review Recovery Codes</Button>
              <Button variant="ghost">Download Audit Report</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
