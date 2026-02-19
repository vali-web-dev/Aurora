import { Suspense } from 'react';
import { AuroraShell } from '@/components/os/AuroraShell';
import { UniverseSkeleton } from '@/components/aurora/UniverseSkeleton';
import { AuroraEditorWorkbench } from '@/components/create/AuroraEditorWorkbench';

export default function AuroraEditorPage() {
  return (
    <AuroraShell>
      <Suspense fallback={<UniverseSkeleton statsCount={4} gridCols={3} itemsCount={12} />}>
        <AuroraEditorWorkbench />
      </Suspense>
    </AuroraShell>
  );
}
