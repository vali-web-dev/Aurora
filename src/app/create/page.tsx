import { Suspense } from 'react';
import { AuroraShell } from '@/components/os/AuroraShell';
import { CreateUniverse } from '@/components/create/CreateUniverse';
import { UniverseSkeleton } from '@/components/aurora/UniverseSkeleton';

export default function CreatePage() {
  return (
    <AuroraShell>
      <Suspense fallback={<UniverseSkeleton statsCount={3} gridCols={3} itemsCount={9} />}>
        <CreateUniverse />
      </Suspense>
    </AuroraShell>
  );
}
