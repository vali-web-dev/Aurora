import { Suspense } from 'react';
import { AuroraShell } from '@/components/os/AuroraShell';
import { ProductivityUniverse } from '@/components/productivity/ProductivityUniverse';
import { UniverseSkeleton } from '@/components/aurora/UniverseSkeleton';

export default function ProductivityPage() {
  return (
    <AuroraShell>
      <Suspense fallback={<UniverseSkeleton statsCount={3} gridCols={4} itemsCount={8} />}>
        <ProductivityUniverse />
      </Suspense>
    </AuroraShell>
  );
}
