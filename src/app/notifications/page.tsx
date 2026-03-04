import { Suspense } from 'react';
import { AuroraShell } from '@/components/os/AuroraShell';
import { NotificationCenterComponent } from '@/components/notifications/NotificationCenterComponent';
import { UniverseSkeleton } from '@/components/aurora/UniverseSkeleton';

export default function NotificationsPage() {
  return (
    <AuroraShell>
      <Suspense fallback={<UniverseSkeleton statsCount={1} gridCols={1} itemsCount={8} />}>
        <NotificationCenterComponent />
      </Suspense>
    </AuroraShell>
  );
}
