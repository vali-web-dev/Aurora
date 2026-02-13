import { Suspense } from 'react';
import { AuroraShell } from '@/components/os/AuroraShell';
import { EntertainmentUniverse } from '@/components/entertainment/EntertainmentUniverse';
import { UniverseSkeleton } from '@/components/aurora/UniverseSkeleton';

export default function EntertainmentPage() {
  return (
    <AuroraShell>
      <Suspense fallback={<UniverseSkeleton statsCount={3} gridCols={3} itemsCount={9} />}>
        <EntertainmentUniverse />
      </Suspense>
    </AuroraShell>
  );
}
