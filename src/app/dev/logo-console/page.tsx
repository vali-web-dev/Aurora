'use client';

import { useMemo, useState } from 'react';
import { MasterLogoConsoleModal } from '@/components/aurora/console/MasterLogoConsoleModal';
import { Button } from '@/components/ui/Button';
import type { Destination } from '@/components/aurora/console/types';

const baseTime = Date.now();

const seedDestinations: Destination[] = [
  { id: 'home', label: 'Home', route: '/home', group: 'worlds', priority: 0.9, usageScore: 0.95, lastUsedAt: baseTime - 1000 * 60 * 6, isPinned: true, isCritical: false, badgeCount: 0, shortCode: 'HM' },
  { id: 'dashboard', label: 'Dashboard', route: '/dashboard', group: 'tools', priority: 0.86, usageScore: 0.88, lastUsedAt: baseTime - 1000 * 60 * 12, isPinned: true, isCritical: false, badgeCount: 0, shortCode: 'DB' },
  { id: 'social', label: 'Social', route: '/social', group: 'worlds', priority: 0.78, usageScore: 0.82, lastUsedAt: baseTime - 1000 * 60 * 35, isPinned: false, isCritical: false, badgeCount: 4, shortCode: 'SC' },
  { id: 'commerce', label: 'Commerce', route: '/commerce', group: 'worlds', priority: 0.74, usageScore: 0.7, lastUsedAt: baseTime - 1000 * 60 * 60, isPinned: false, isCritical: false, badgeCount: 2, shortCode: 'CM' },
  { id: 'automation', label: 'Automation', route: '/automation', group: 'tools', priority: 0.66, usageScore: 0.72, lastUsedAt: baseTime - 1000 * 60 * 16, isPinned: true, isCritical: false, badgeCount: 1, shortCode: 'AU' },
  { id: 'health', label: 'Health', route: '/health', group: 'worlds', priority: 0.64, usageScore: 0.58, lastUsedAt: baseTime - 1000 * 60 * 180, isPinned: false, isCritical: false, badgeCount: 0, shortCode: 'HL' },
  { id: 'security', label: 'Security', route: '/security', group: 'system', priority: 0.8, usageScore: 0.52, lastUsedAt: baseTime - 1000 * 60 * 25, isPinned: false, isCritical: true, badgeCount: 1, shortCode: 'SE' },
  { id: 'settings', label: 'Settings', route: '/settings', group: 'system', priority: 0.72, usageScore: 0.6, lastUsedAt: baseTime - 1000 * 60 * 44, isPinned: true, isCritical: false, badgeCount: 0, shortCode: 'ST' },
  { id: 'learning', label: 'Learning', route: '/learning', group: 'worlds', priority: 0.52, usageScore: 0.49, lastUsedAt: baseTime - 1000 * 60 * 240, isPinned: false, isCritical: false, badgeCount: 0, shortCode: 'LR' },
  { id: 'travel', label: 'Travel', route: '/travel', group: 'worlds', priority: 0.5, usageScore: 0.42, lastUsedAt: baseTime - 1000 * 60 * 300, isPinned: false, isCritical: false, badgeCount: 0, shortCode: 'TR' },
];

export default function LogoConsoleDevPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [currentRoute, setCurrentRoute] = useState('/dashboard');

  const destinations = useMemo(() => seedDestinations, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-4">
        <h1 className="text-3xl md:text-4xl font-semibold">Master Logo Console — v1 Dev</h1>
        <p className="text-slate-400">
          Functional-first modal prototype with primary ring slots, keyboard targeting, and Aurora token styling.
        </p>

        <div className="flex gap-3 flex-wrap">
          <Button variant="primary" animation="shimmer" onClick={() => setIsOpen(true)}>
            Open Console
          </Button>
          <Button variant="secondary" onClick={() => setCurrentRoute('/home')}>
            Set Route: /home
          </Button>
          <Button variant="secondary" onClick={() => setCurrentRoute('/dashboard')}>
            Set Route: /dashboard
          </Button>
          <Button variant="secondary" onClick={() => setCurrentRoute('/social')}>
            Set Route: /social
          </Button>
        </div>

        <p className="text-sm text-slate-500">Current route context: {currentRoute}</p>
      </div>

      <MasterLogoConsoleModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        destinations={destinations}
        currentRoute={currentRoute}
        onNavigate={(route) => setCurrentRoute(route)}
      />
    </main>
  );
}
