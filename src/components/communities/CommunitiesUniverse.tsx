'use client';

import { Card, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/aurora/Button';
import { StatCard } from '@/components/aurora/StatCard';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { AuroraDataService } from '@/data/types';
import { formatDate } from '@/lib/utils';

// See AURORA_MANUAL.md § The 15 Universes: Communities Universe.
// See AURORA_QUICK_REFERENCE.md § 15 Universes at a Glance.
const communities = AuroraDataService.getCommunities();
const posts = AuroraDataService.getCommunityPosts();

const events = [
  {
    id: 'event-1',
    title: 'Aurora Builders Town Hall',
    date: new Date('2026-02-16T18:00:00'),
    status: 'live',
  },
  {
    id: 'event-2',
    title: 'Creator Studio Workshop',
    date: new Date('2026-02-20T17:00:00'),
    status: 'upcoming',
  },
  {
    id: 'event-3',
    title: 'Community Showcase Night',
    date: new Date('2026-02-08T19:30:00'),
    status: 'completed',
  },
];

export function CommunitiesUniverse() {
  return (
    <Surface className="py-8">
      <SurfaceHeader
        title="Communities Universe"
        description="Belong to spaces that share your craft, values, and momentum."
        actions={<Button variant="primary">Create Community</Button>}
      />

      <SurfaceSection title="Community Snapshot">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Communities" value={communities.length} helper="Active" />
          <StatCard label="Posts" value={posts.length} helper="This week" />
          <StatCard label="Events" value={events.length} helper="Live + upcoming" />
        </div>
      </SurfaceSection>

      <SurfaceSection title="Community Directory" description="Discover spaces built for creators, learners, and builders.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Community directory">
          {communities.map((community) => (
            <Card key={community.id} className="space-y-3" role="listitem">
              <div className="flex items-center justify-between">
                <CardTitle>{community.name}</CardTitle>
                <Badge size="sm" variant={community.visibility === 'public' ? 'success' : 'warning'}>
                  {community.visibility}
                </Badge>
              </div>
              <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">{community.description}</p>
              <p className="aurora-label text-xs text-slate-500 dark:text-slate-500">/{community.slug}</p>
              <Button variant="ghost" size="sm">View Space</Button>
            </Card>
          ))}
        </div>
      </SurfaceSection>

      <SurfaceSection title="Posts & Threads" description="Recent conversations across your communities.">
        <Card className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <p className="aurora-label text-slate-900 dark:text-slate-50">{post.title}</p>
                <Badge size="sm" variant="default">
                  {communities.find((community) => community.id === post.communityId)?.name ?? 'Community'}
                </Badge>
              </div>
              <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">{post.body}</p>
              <div className="aurora-label flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                <span>{post.likes} likes</span>
                <span>{post.comments} comments</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          ))}
        </Card>
      </SurfaceSection>

      <SurfaceSection title="Events & Live Rooms" description="Gather in real time or review what you missed.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="list" aria-label="Community events">
          {events.map((event) => (
            <Card key={event.id} role="listitem" className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{event.title}</CardTitle>
                <Badge size="sm" variant={event.status === 'live' ? 'success' : event.status === 'upcoming' ? 'info' : 'default'}>
                  {event.status}
                </Badge>
              </div>
              <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">{formatDate(event.date)}</p>
              <Button variant="secondary" size="sm">Open Room</Button>
            </Card>
          ))}
        </div>
      </SurfaceSection>
    </Surface>
  );
}
