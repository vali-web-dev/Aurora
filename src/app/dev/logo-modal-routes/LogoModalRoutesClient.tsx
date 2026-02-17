'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { AuroraLogoRoutesModal } from '@/components/aurora/AuroraLogoRoutesModal';

type RouteId = 'a' | 'b' | 'c';

interface LogoModalRoutesClientProps {
  routeIcons: Record<RouteId, string>;
}

export function LogoModalRoutesClient({ routeIcons }: LogoModalRoutesClientProps) {
  const [open, setOpen] = useState(true);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-5">
        <h1 className="text-3xl md:text-4xl font-semibold">Aurora Logo Routes Modal</h1>
        <p className="text-slate-400 max-w-2xl">
          Archive-safe second modal: same Aurora crystal-water style, no diamond frame, original A/B/C route icons.
        </p>
        <Button variant="primary" animation="shimmer" onClick={() => setOpen(true)}>
          Open Route Logo Modal
        </Button>
      </div>

      <AuroraLogoRoutesModal isOpen={open} onClose={() => setOpen(false)} routeIcons={routeIcons} />
    </main>
  );
}
