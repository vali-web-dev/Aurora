import { Suspense } from 'react';
import { AuroraShell } from '@/components/os/AuroraShell';
import { CommunityChat } from '@/components/communities/CommunityChat';
import { UniverseSkeleton } from '@/components/aurora/UniverseSkeleton';

interface CommunityDetailPageProps {
  params: {
    id: string;
  };
}

export default function CommunityDetailPage({ params: { id } }: CommunityDetailPageProps) {
  const communityId = parseInt(id);

  // Fetch community details from API
  // In production, validate access and permissions here
  const communityName = `Community #${communityId}`; // Placeholder

  return (
    <AuroraShell>
      <Suspense fallback={<UniverseSkeleton statsCount={2} gridCols={1} itemsCount={10} />}>
        <CommunityChat communityId={communityId} communityName={communityName} />
      </Suspense>
    </AuroraShell>
  );
}
