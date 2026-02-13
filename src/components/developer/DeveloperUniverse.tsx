'use client';

import { Card } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/aurora/Button';
import { StatCard } from '@/components/aurora/StatCard';
import { AuroraDataService } from '@/data/types';

const plugins = AuroraDataService.getPlugins();
const apiKeys = AuroraDataService.getApiKeys();
const webhooks = AuroraDataService.getWebhooks();

const activeKeys = apiKeys.filter((key) => key.status === 'active').length;
const revokedKeys = apiKeys.filter((key) => key.status === 'revoked').length;
const usageTrend = [22, 31, 28, 36, 44, 52, 48];
const releaseVelocity = [3, 5, 4, 6, 5, 7];

const latestActivity = [
  {
    id: 'dev-activity-1',
    title: `${plugins[0]?.name ?? 'New plugin'} released`,
    detail: `Version ${plugins[0]?.version ?? '1.0.0'} • ${plugins[0]?.status ?? 'active'}`,
  },
  {
    id: 'dev-activity-2',
    title: `${apiKeys[0]?.label ?? 'API key'} accessed`,
    detail: apiKeys[0]?.lastUsedAt
      ? `Last used ${apiKeys[0].lastUsedAt.toLocaleDateString()}`
      : 'Last used recently',
  },
  {
    id: 'dev-activity-3',
    title: `Webhook ${webhooks[0]?.status ?? 'active'}`,
    detail: webhooks[0]?.events?.[0] ?? 'commerce.order.created',
  },
];

export function DeveloperUniverse() {
  return (
    <div className="space-y-8 py-8">
      <div className="space-y-3">
        <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-50">Developer Universe</h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl">
          Build extensions, connect APIs, and ship custom surfaces across Aurora.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Plugins" value={plugins.length} />
        <StatCard label="API Keys" value={apiKeys.length} />
        <StatCard label="Webhooks" value={webhooks.length} />
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Platform Health
            </p>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Build Signal</h2>
          </div>
          <Badge size="sm" variant="success">99.98% uptime</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">API Usage (7d)</p>
            <div className="flex items-end gap-2 h-20">
              {usageTrend.map((value, index) => (
                <div key={`usage-${value}-${index}`} className="flex-1">
                  <div
                    className="w-full rounded-md bg-indigo-500/80"
                    style={{ height: `${value}%` }}
                    title={`Day ${index + 1}: ${value}k calls`}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Peak 52k calls</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Release Velocity</p>
            <div className="flex items-end gap-2 h-20">
              {releaseVelocity.map((value, index) => (
                <div key={`release-${value}-${index}`} className="flex-1">
                  <div
                    className="w-full rounded-md bg-emerald-500/80"
                    style={{ height: `${value * 10}%` }}
                    title={`Week ${index + 1}: ${value} releases`}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Weekly plugin releases</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Security Status</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{activeKeys} active</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {revokedKeys} revoked • 0 compromised
            </p>
            <Button variant="secondary" size="sm">Rotate Keys</Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-8">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Plugin Registry</h2>
            <Button variant="secondary" size="sm">Create Plugin</Button>
          </div>
          <div className="space-y-3">
            {plugins.map((plugin) => (
              <div key={plugin.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{plugin.name}</p>
                  <Badge size="sm" variant={plugin.status === 'active' ? 'success' : plugin.status === 'beta' ? 'warning' : 'default'}>
                    {plugin.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {plugin.description}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>v{plugin.version}</span>
                  <span>{plugin.installs.toLocaleString()} installs</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">API Keys</h2>
              <Button variant="ghost" size="sm">New Key</Button>
            </div>
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div key={key.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 dark:text-slate-50">{key.label}</p>
                    <Badge size="sm" variant={key.status === 'active' ? 'success' : 'default'}>
                      {key.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Created {key.createdAt.toLocaleDateString()}
                    {key.lastUsedAt ? ` • Last used ${key.lastUsedAt.toLocaleDateString()}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Webhooks</h2>
              <Button variant="ghost" size="sm">Add Endpoint</Button>
            </div>
            <div className="space-y-3">
              {webhooks.map((hook) => (
                <div key={hook.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 dark:text-slate-50">{hook.url}</p>
                    <Badge size="sm" variant={hook.status === 'active' ? 'success' : 'warning'}>
                      {hook.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Events: {hook.events.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Latest Activity</h2>
              <Button variant="ghost" size="sm">View</Button>
            </div>
            <div className="space-y-3">
              {latestActivity.map((item) => (
                <div key={item.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{item.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
