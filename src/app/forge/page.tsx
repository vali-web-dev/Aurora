import { Suspense } from 'react';
import { AuroraShell } from '@/components/os/AuroraShell';
import { ForgeUniverse } from '@/components/forge/ForgeUniverse';
import { UniverseSkeleton } from '@/components/aurora/UniverseSkeleton';

export default function ForgePage() {
  return (
    <AuroraShell>
      <Suspense fallback={<UniverseSkeleton statsCount={3} gridCols={3} itemsCount={9} />}>
        <ForgeUniverse />
      </Suspense>
    </AuroraShell>
  );
}