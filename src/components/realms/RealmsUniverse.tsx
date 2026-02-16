'use client';

import { useState, type CSSProperties } from 'react';
import { Card, CardTitle } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';
import { mockRealms, mockRealmUsage } from '@/data/types';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { expandableNavigation } from '@/lib/expandable-navigation';
import { PageIcon, getPageIconColor } from '@/components/aurora/PageIcons';

export function RealmsUniverse() {
  const [activeRealm, setActiveRealm] = useState<string | null>(null);
  const primaryPortals = expandableNavigation.filter((item) => item.group === 'Primary');
  const orbitPrimary = primaryPortals.slice(0, 10);
  const orbitSecondary = primaryPortals.flatMap((item) => item.children ?? []).slice(0, 16);

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
      <div className="flex justify-center">
        <div className="aurora-portals-logo" role="img" aria-label="Aurora Portals gateway">
          <div className="aurora-portals-core">
            <div className="aurora-portals-core-ring" />
            <div className="aurora-portals-core-mark">A</div>
            <div className="aurora-portals-core-label">Aurora Portals</div>
          </div>

          <div className="aurora-portals-orbit aurora-portals-orbit--outer">
            {orbitPrimary.map((item, index) => (
              <div
                key={item.href}
                className="aurora-portals-orbit-item"
                style={{
                  ['--orbit-index' as string]: index,
                  ['--orbit-count' as string]: orbitPrimary.length,
                  ['--orbit-delay' as string]: `${(index / Math.max(orbitPrimary.length, 1)) * 12}s`,
                } as CSSProperties}
              >
                <div className={`aurora-portals-icon ${getPageIconColor(item.label)}`}>
                  <PageIcon pageName={item.label} className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>

          <div className="aurora-portals-orbit aurora-portals-orbit--inner">
            {orbitSecondary.map((item, index) => (
              <div
                key={`${item.href}-${index}`}
                className="aurora-portals-orbit-item aurora-portals-orbit-item--inner"
                style={{
                  ['--orbit-index' as string]: index,
                  ['--orbit-count' as string]: orbitSecondary.length,
                  ['--orbit-delay' as string]: `${(index / Math.max(orbitSecondary.length, 1)) * 10}s`,
                } as CSSProperties}
              >
                <div className={`aurora-portals-icon aurora-portals-icon--small ${getPageIconColor(item.label)}`}>
                  <PageIcon pageName={item.label} className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SurfaceHeader
        title="Realms Universe"
        description="Themed environments designed for different states of mind and creative intentions."
      />

      <SurfaceSection title="Realm Snapshot">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-900">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="aurora-label text-sm text-slate-600 dark:text-slate-400 mb-1">This Week</p>
                <p className="aurora-label text-3xl font-bold text-slate-900 dark:text-slate-50">
                  {hours}h {minutes}m
                </p>
              </div>
              <div>
                <p className="aurora-label text-sm text-slate-600 dark:text-slate-400 mb-1">Most Active</p>
                <p className="aurora-label text-3xl font-bold text-slate-900 dark:text-slate-50">
                  {mostActiveRealm.name}
                </p>
              </div>
              <div>
                <p className="aurora-label text-sm text-slate-600 dark:text-slate-400 mb-1">Realms Visited</p>
                <p className="aurora-label text-3xl font-bold text-slate-900 dark:text-slate-50">{mockRealms.length}</p>
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
                      <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
                        {realm.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {realm.features.map((feature, idx) => (
                        <div key={idx} className="aurora-label flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <span className="text-lg">✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <p className="aurora-label text-xs text-slate-500 dark:text-slate-400 font-medium">
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
                  className="aurora-label text-3xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Close active realm"
                  type="button"
                >
                  ✕
                </button>
              </div>

              <p className="aurora-label text-slate-600 dark:text-slate-400">
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
                <p className="aurora-label text-slate-900 dark:text-slate-50">Session Options:</p>
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
                <p className="aurora-label text-sm text-slate-600 dark:text-slate-400 mb-1">Most Focused Day</p>
                <p className="aurora-label text-2xl font-bold text-slate-900 dark:text-slate-50">Tuesday</p>
                <p className="aurora-label text-xs text-slate-600 dark:text-slate-400 mt-2">2.3h in Focus Realm</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-slate-800 rounded-lg">
                <p className="aurora-label text-sm text-slate-600 dark:text-slate-400 mb-1">Creative Peak</p>
                <p className="aurora-label text-2xl font-bold text-slate-900 dark:text-slate-50">Evening</p>
                <p className="aurora-label text-xs text-slate-600 dark:text-slate-400 mt-2">Most Creation sessions</p>
              </div>
            </div>
          </div>
        </Card>
      </SurfaceSection>
      <style jsx>{`
        .aurora-portals-logo {
          position: relative;
          width: min(520px, 92vw);
          height: min(520px, 92vw);
          margin-bottom: 24px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          overflow: hidden;
          background: radial-gradient(circle at 20% 20%, rgba(76, 29, 149, 0.35), transparent 55%),
            radial-gradient(circle at 80% 30%, rgba(59, 130, 246, 0.25), transparent 60%),
            rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 40px rgba(168, 85, 247, 0.5), 0 0 120px rgba(59, 130, 246, 0.35);
          animation: aurora-logo-float 5.2s ease-in-out infinite;
          will-change: transform, box-shadow;
        }
        .aurora-portals-logo:hover {
          box-shadow: 0 0 60px rgba(236, 72, 153, 0.6), 0 0 160px rgba(59, 130, 246, 0.45);
        }
        .aurora-portals-core {
          position: relative;
          width: 190px;
          height: 190px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          text-align: center;
          background: radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.55), rgba(59, 130, 246, 0.2) 60%, rgba(15, 23, 42, 0.9) 100%);
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.55), inset 0 0 24px rgba(255, 255, 255, 0.08);
          animation: aurora-core-breathe 3.4s ease-in-out infinite;
          will-change: transform, box-shadow;
        }
        .aurora-portals-core-ring {
          position: absolute;
          inset: -12px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 24px rgba(59, 130, 246, 0.3);
          animation: aurora-ring-spin 14s linear infinite;
          will-change: transform;
        }
        .aurora-portals-core-mark {
          font-size: 44px;
          font-weight: 700;
          letter-spacing: 0.25em;
          color: rgba(255, 255, 255, 0.95);
          text-shadow: 0 0 18px rgba(168, 85, 247, 0.6);
        }
        .aurora-portals-core-label {
          margin-top: 8px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.35em;
          color: rgba(226, 232, 240, 0.65);
        }
        .aurora-portals-orbit {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          animation: aurora-orbit-spin 26s linear infinite;
          will-change: transform;
        }
        .aurora-portals-orbit--inner {
          inset: 58px;
          animation: aurora-orbit-spin-reverse 32s linear infinite;
          will-change: transform;
        }
        .aurora-portals-orbit-item {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: rotate(calc(360deg * var(--orbit-index) / var(--orbit-count))) translateX(210px);
          transform-origin: 0 0;
        }
        .aurora-portals-orbit-item--inner {
          transform: rotate(calc(360deg * var(--orbit-index) / var(--orbit-count))) translateX(125px);
        }
        .aurora-portals-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.16);
          box-shadow: 0 0 12px rgba(168, 85, 247, 0.4);
          animation: aurora-icon-glide 12s ease-in-out infinite;
          animation-delay: var(--orbit-delay);
          transition: transform 220ms ease, box-shadow 220ms ease;
          will-change: transform, box-shadow;
        }
        .aurora-portals-icon--small {
          width: 28px;
          height: 28px;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.35);
        }
        .aurora-portals-logo:hover .aurora-portals-icon {
          transform: scale(1.08);
          box-shadow: 0 0 18px rgba(236, 72, 153, 0.55);
        }
        @keyframes aurora-orbit-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes aurora-orbit-spin-reverse {
          0% {
            transform: rotate(360deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        @keyframes aurora-ring-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes aurora-core-breathe {
          0%, 100% {
            transform: scale3d(1, 1, 1);
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.55), inset 0 0 24px rgba(255, 255, 255, 0.08);
          }
          50% {
            transform: scale3d(1.03, 1.03, 1);
            box-shadow: 0 0 45px rgba(236, 72, 153, 0.6), inset 0 0 30px rgba(255, 255, 255, 0.12);
          }
        }
        @keyframes aurora-logo-float {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, 8px, 0);
          }
        }
        @keyframes aurora-icon-glide {
          0%, 100% {
            transform: scale3d(0.92, 0.92, 1) rotate(0deg);
            filter: brightness(0.9);
          }
          50% {
            transform: scale3d(1.1, 1.1, 1) rotate(8deg);
            filter: brightness(1.25);
          }
        }
        @media (max-width: 640px) {
          .aurora-portals-logo {
            width: min(380px, 90vw);
            height: min(380px, 90vw);
          }
          .aurora-portals-orbit-item {
            transform: rotate(calc(360deg * var(--orbit-index) / var(--orbit-count))) translateX(150px);
          }
          .aurora-portals-orbit-item--inner {
            transform: rotate(calc(360deg * var(--orbit-index) / var(--orbit-count))) translateX(95px);
          }
          .aurora-portals-core {
            width: 150px;
            height: 150px;
          }
          .aurora-portals-core-mark {
            font-size: 34px;
          }
        }
      `}</style>
    </Surface>
  );
}
