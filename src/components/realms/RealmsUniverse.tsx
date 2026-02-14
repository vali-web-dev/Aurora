'use client';

import { useState } from 'react';
import { Card, CardTitle } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';
import { mockRealms, mockRealmUsage } from '@/data/types';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';

export function RealmsUniverse() {
  const [activeRealm, setActiveRealm] = useState<string | null>(null);

  const totalTime = mockRealms.reduce((sum, realm) => {
    const usage = mockRealmUsage[realm.id];
    return sum + (usage?.minutes ?? 0);
  }, 0);

  const hours = Math.floor(totalTime / 60);
  const minutes = totalTime % 60;

  const mostActiveRealm = mockRealms.reduce((current, realm) => {
    const currentMinutes = mockRealmUsage[current.id]?.minutes ?? 0;
    const nextMinutes = mockRealmUsage[realm.id]?.minutes ?? 0;
    return nextMinutes > currentMinutes ? realm : current;
  }, mockRealms[0]);

  return (
    <Surface className="py-8">
      <SurfaceHeader
        title="Realms Universe"
        description="Themed environments designed for different states of mind and creative intentions."
      />

      <SurfaceSection title="Realm Snapshot">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-900">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">This Week</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                  {hours}h {minutes}m
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Most Active</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                  {mostActiveRealm.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Realms Visited</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{mockRealms.length}</p>
              </div>
            </div>
          </div>
        </Card>
      </SurfaceSection>

      <SurfaceSection title="Enter a Realm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockRealms.map((realm) => {
            const isActive = activeRealm === realm.id;

            return (
              <button
                key={realm.id}
                onClick={() => setActiveRealm(realm.id)}
                className="text-left rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
                aria-pressed={isActive}
                aria-label={`Enter ${realm.name} realm`}
                type="button"
              >
                <Card
                  hoverable
                  className={
                    isActive
                      ? 'cursor-pointer h-full ring-2 ring-blue-500/40 border-blue-200 dark:border-blue-800'
                      : 'cursor-pointer h-full'
                  }
                >
                  <div className="space-y-4">
                    <div className={`h-32 bg-gradient-to-br ${realm.color} rounded-lg flex items-center justify-center text-6xl`}>
                      {realm.icon}
                    </div>

                    <div className="space-y-2">
                      <CardTitle className="text-xl">
                        {realm.name}
                      </CardTitle>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {realm.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {realm.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <span className="text-lg">✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      📊 {mockRealmUsage[realm.id]?.timeLabel ?? '0h 0m this week'}
                    </p>

                    <Button variant="primary" size="sm" className="w-full">
                      Enter Realm →
                    </Button>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      </SurfaceSection>

      {activeRealm && (
        <SurfaceSection title="Active Realm">
          <Card className="bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">
                  {mockRealms.find((r) => r.id === activeRealm)?.name} Realm
                </CardTitle>
                <button
                  onClick={() => setActiveRealm(null)}
                  className="text-3xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Close active realm"
                  type="button"
                >
                  ✕
                </button>
              </div>

              <p className="text-slate-600 dark:text-slate-400">
                {mockRealms.find((r) => r.id === activeRealm)?.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="primary" size="lg">
                  🚀 Launch Session
                </Button>
                <Button variant="secondary" size="lg">
                  ⚙️ Configure Realm
                </Button>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg space-y-2">
                <p className="font-semibold text-slate-900 dark:text-slate-50">Session Options:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['25m', '45m', '90m', 'Unlimited'].map((time) => (
                    <Button key={time} variant="ghost" size="sm" className="text-sm">
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </SurfaceSection>
      )}

      <SurfaceSection title="Realm Insights">
        <Card>
          <div className="space-y-4">
            <CardTitle className="text-xl">Your Realm Insights</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Most Focused Day</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">Tuesday</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">2.3h in Focus Realm</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Creative Peak</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">Evening</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">Most Creation sessions</p>
              </div>
            </div>
          </div>
        </Card>
      </SurfaceSection>
    </Surface>
  );
}
