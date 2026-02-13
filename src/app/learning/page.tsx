import { Suspense } from 'react';
import { AuroraShell } from '@/components/os/AuroraShell';
import { LearningUniverse } from '@/components/learning/LearningUniverse';
import { UniverseSkeleton } from '@/components/aurora/UniverseSkeleton';

export default function LearningPage() {
  return (
    <AuroraShell>
      <Suspense fallback={<UniverseSkeleton statsCount={3} gridCols={3} itemsCount={6} />}>
        <LearningUniverse />
      </Suspense>
    </AuroraShell>
  );
}