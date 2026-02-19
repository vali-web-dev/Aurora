'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SingleChainSegmentModal } from '@/components/aurora/ring-engine/SingleChainSegmentModal';
import type { RingLink } from '@/components/aurora/ring-engine/types';

const sampleLink: RingLink = {
  id: 'social',
  label: 'Social',
  route: '/social',
  iconText: 'SC',
  group: 'worlds',
  isMain: true,
  isCritical: false,
  weight: 0.96,
};

export default function LogoChainSegmentPage() {
  const [open, setOpen] = useState(true);
  const [currentRoute, setCurrentRoute] = useState('/home');

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-3xl md:text-4xl font-semibold">Single Chain Segment Craft</h1>
        <p className="text-slate-400">
          Isolated module workshop for one chain-link arc panel before ring assembly.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button variant="primary" animation="shimmer" onClick={() => setOpen(true)}>
            Open Segment Modal
          </Button>
          <Button variant="secondary" onClick={() => setCurrentRoute('/social')}>
            Route: /social
          </Button>
          <Button variant="secondary" onClick={() => setCurrentRoute('/dashboard')}>
            Route: /dashboard
          </Button>
        </div>

        <p className="text-sm text-slate-500">Current route context: {currentRoute}</p>
      </div>

      <SingleChainSegmentModal
        isOpen={open}
        onClose={() => setOpen(false)}
        link={sampleLink}
        onNavigate={(route) => setCurrentRoute(route)}
      />
    </main>
  );
}
