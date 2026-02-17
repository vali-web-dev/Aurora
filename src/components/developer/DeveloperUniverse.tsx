'use client';

import { Card, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/aurora/StatCard';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { AuroraDataService } from '@/data/types';
import { formatDate, formatNumber } from '@/lib/utils';

const plugins = AuroraDataService.getPlugins();
const apiKeys = AuroraDataService.getApiKeys();
const webhooks = AuroraDataService.getWebhooks();

const activeKeys = apiKeys.filter((key) => key.status === 'active').length;
const revokedKeys = apiKeys.filter((key) => key.status === 'revoked').length;
const usageTrend = [22, 31, 28, 36, 44, 52, 48];
const releaseVelocity = [3, 5, 4, 6, 5, 7];

export function DeveloperUniverse() {
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
        ? `Last used ${formatDate(apiKeys[0].lastUsedAt)}`
        : 'Last used recently',
    },
    {
      id: 'dev-activity-3',
      title: `Webhook ${webhooks[0]?.status ?? 'active'}`,
      detail: webhooks[0]?.events?.[0] ?? 'commerce.order.created',
    },
  ];

  return (
    <Surface className="py-8">
      <SurfaceHeader
        title="Developer Universe"
        description="Build extensions, connect APIs, and ship custom surfaces across Aurora."
      />

      <SurfaceSection title="Developer Snapshot">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Plugins" value={plugins.length} helper="Published" />
          <StatCard label="API Keys" value={apiKeys.length} helper="Active + revoked" />
          <StatCard label="Webhooks" value={webhooks.length} helper="Connected" />
        </div>
      </SurfaceSection>

      <SurfaceSection title="Build Signal" description="Telemetry and platform health.">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="aurora-label text-slate-500 dark:text-slate-400">
                Platform Health
              </p>
              <CardTitle>Build Signal</CardTitle>
            </div>
            <Badge size="sm" variant="success">99.98% uptime</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="list" aria-label="Build signal metrics">
            <div className="space-y-2">
              <p className="aurora-label text-sm text-slate-900 dark:text-slate-50">API Usage (7d)</p>
              <div className="flex items-end gap-2 h-20" role="list" aria-label="API usage trend">
                {usageTrend.map((value, index) => (
                  <div key={`usage-${value}-${index}`} role="listitem" className="flex-1">
                    <div
                      className="w-full rounded-md bg-indigo-500/80"
                      style={{ height: `${value}%` }}
                      title={`Day ${index + 1}: ${value}k calls`}
                    />
                  </div>
                ))}
              </div>
              <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">Peak 52k calls</p>
            </div>
            <div className="space-y-2">
              <p className="aurora-label text-sm text-slate-900 dark:text-slate-50">Release Velocity</p>
              <div className="flex items-end gap-2 h-20" role="list" aria-label="Release velocity">
                {releaseVelocity.map((value, index) => (
                  <div key={`release-${value}-${index}`} role="listitem" className="flex-1">
                    <div
                      className="w-full rounded-md bg-emerald-500/80"
                      style={{ height: `${value * 10}%` }}
                      title={`Week ${index + 1}: ${value} releases`}
                    />
                  </div>
                ))}
              </div>
              <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">Weekly plugin releases</p>
            </div>
            <div className="space-y-2">
              <p className="aurora-label text-sm text-slate-900 dark:text-slate-50">Security Status</p>
              <p className="aurora-label text-2xl font-bold text-slate-900 dark:text-slate-50">{activeKeys} active</p>
              <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                {revokedKeys} revoked • 0 compromised
              </p>
              <Button variant="secondary" size="sm">Rotate Keys</Button>
            </div>
          </div>
        </Card>
      </SurfaceSection>

      <SurfaceSection title="Registry & Operations">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-8">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>Plugin Registry</CardTitle>
              <Button variant="secondary" size="sm">Create Plugin</Button>
            </div>
            <div className="space-y-3" role="list" aria-label="Plugins">
              {plugins.map((plugin) => (
                <div key={plugin.id} role="listitem" className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="aurora-label text-slate-900 dark:text-slate-50">{plugin.name}</p>
                    <Badge size="sm" variant={plugin.status === 'active' ? 'success' : plugin.status === 'beta' ? 'warning' : 'default'}>
                      {plugin.status}
                    </Badge>
                  </div>
                  <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                    {plugin.description}
                  </p>
                  <div className="aurora-label flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>v{plugin.version}</span>
                    <span>{formatNumber(plugin.installs)} installs</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle>API Keys</CardTitle>
                <Button variant="ghost" size="sm">New Key</Button>
              </div>
              <div className="space-y-3" role="list" aria-label="API keys">
                {apiKeys.map((key) => (
                  <div key={key.id} role="listitem" className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="aurora-label text-slate-900 dark:text-slate-50">{key.label}</p>
                      <Badge size="sm" variant={key.status === 'active' ? 'success' : 'default'}>
                        {key.status}
                      </Badge>
                    </div>
                    <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                      Created {formatDate(key.createdAt)}
                      {key.lastUsedAt ? ` • Last used ${formatDate(key.lastUsedAt)}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle>Webhooks</CardTitle>
                <Button variant="ghost" size="sm">Add Endpoint</Button>
              </div>
              <div className="space-y-3">
                {webhooks.map((hook) => (
                  <div key={hook.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="aurora-label text-slate-900 dark:text-slate-50">{hook.url}</p>
                      <Badge size="sm" variant={hook.status === 'active' ? 'success' : 'warning'}>
                        {hook.status}
                      </Badge>
                    </div>
                    <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                      Events: {hook.events.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle>Latest Activity</CardTitle>
                <Button variant="ghost" size="sm">View</Button>
              </div>
              <div className="space-y-3">
                {latestActivity.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <p className="aurora-label text-slate-900 dark:text-slate-50">{item.title}</p>
                    <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </SurfaceSection>
    </Surface>
  );
}
