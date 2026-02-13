import { Suspense } from 'react';
import { AuroraShell } from '@/components/os/AuroraShell';
import { SocialUniverse } from '@/components/social/SocialUniverse';
import { UniverseSkeleton } from '@/components/aurora/UniverseSkeleton';

export default function SocialPage() {
  return (
    <AuroraShell>
      <Suspense fallback={<UniverseSkeleton statsCount={3} gridCols={2} itemsCount={6} />}>
        <SocialUniverse />
      </Suspense>
    </AuroraShell>
  );
}
