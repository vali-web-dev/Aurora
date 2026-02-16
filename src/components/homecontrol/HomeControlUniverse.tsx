'use client';

import { Card, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/aurora/Button';
import { StatCard } from '@/components/aurora/StatCard';
import { AuroraDataService } from '@/data/types';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { formatTime } from '@/lib/utils';

const devices = AuroraDataService.getSmartDevices();
const scenes = AuroraDataService.getHomeScenes();
const automations = AuroraDataService.getSmartAutomations();
const energy = AuroraDataService.getEnergyUsage();

const onlineDevices = devices.filter((d) => d.status === 'online').length;
const enabledAutomations = automations.filter((a) => a.enabled).length;
const currentEnergyUsage = energy.length > 0 ? energy[0].powerUsageWatts : 0;

export function HomeControlUniverse() {
  return (
    <Surface className="py-8">
      <SurfaceHeader
        title="Home Control Universe"
        description="Smart devices, scenes, automations, and energy intelligence for connected living."
      />

      <SurfaceSection title="Home Snapshot">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Devices Online" value={onlineDevices} helper={`of ${devices.length}`} />
          <StatCard label="Active Automations" value={enabledAutomations} helper="Enabled" />
          <StatCard label="Current Usage" value={`${currentEnergyUsage}W`} helper="Right now" />
        </div>
      </SurfaceSection>

      <SurfaceSection title="Connected Home">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Smart Devices
              </p>
              <CardTitle>Connected Home</CardTitle>
            </div>
            <Badge size="sm" variant="success">All healthy</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Smart devices">
            {devices.map((device) => (
              <div key={device.id} role="listitem" className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{device.name}</p>
                  <Badge size="sm" variant={device.status === 'online' ? 'success' : 'error'}>
                    {device.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {device.type} • {device.room}
                </p>
                {device.battery !== undefined && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Battery: {device.battery}%
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </SurfaceSection>

      <SurfaceSection title="Scenes & Automations">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-8">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>Scenes</CardTitle>
              <Button variant="secondary" size="sm">Create Scene</Button>
            </div>
            <div className="space-y-3" role="list" aria-label="Scenes">
              {scenes.map((scene) => (
                <div key={scene.id} role="listitem" className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 dark:text-slate-50">{scene.name}</p>
                    <Button variant="ghost" size="sm">Activate</Button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{scene.description}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Triggered {scene.triggeredCount} times
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle>Automations</CardTitle>
                <Button variant="ghost" size="sm">Add</Button>
              </div>
              <div className="space-y-3" role="list" aria-label="Automations">
                {automations.map((auto) => (
                  <div key={auto.id} role="listitem" className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900 dark:text-slate-50">{auto.name}</p>
                      <Badge size="sm" variant={auto.enabled ? 'success' : 'default'}>
                        {auto.enabled ? 'ON' : 'OFF'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{auto.triggerCondition}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-3">
              <CardTitle>Energy Efficiency</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                You&apos;re using {((currentEnergyUsage / 3000) * 100).toFixed(0)}% of typical peak usage.
              </p>
              <Button variant="primary" size="sm">Optimize Settings</Button>
            </Card>
          </div>
        </div>
      </SurfaceSection>

      <SurfaceSection title="Energy Usage">
        <Card className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Energy usage">
            {energy.map((record) => (
              <div key={record.id} role="listitem" className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900 dark:text-slate-50">
                    {formatTime(record.timestamp)}
                  </p>
                  <Badge size="sm" variant="info">${record.costEstimate.toFixed(2)}</Badge>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{record.powerUsageWatts}W</p>
                <div className="space-y-2" role="list" aria-label="Device breakdown">
                  {Object.entries(record.deviceBreakdown).map(([device, wattage]) => (
                    <div key={device} role="listitem" className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>{device}</span>
                      <span>{wattage}W</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </SurfaceSection>
    </Surface>
  );
}
