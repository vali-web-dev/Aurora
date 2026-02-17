'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { AuroraLogoModal } from '@/components/aurora/AuroraLogoModal';

export default function LogoModalDevPage() {
  const [open, setOpen] = useState(true);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-5">
        <h1 className="text-3xl md:text-4xl font-semibold">Aurora Default Logo Modal</h1>
        <p className="text-slate-400 max-w-2xl">
          Interactive concept modal using Aurora root variables and button design language.
        </p>
        <Button variant="primary" animation="shimmer" onClick={() => setOpen(true)}>
          Open Logo Modal
        </Button>
      </div>

      <AuroraLogoModal isOpen={open} onClose={() => setOpen(false)} />
    </main>
  );
}
