'use client';

import { Card, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/aurora/Button';
import { StatCard } from '@/components/aurora/StatCard';
import { SocialPostCard } from '@/components/social/SocialPostCard';
import { AuroraDataService } from '@/data/types';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { formatNumber } from '@/lib/utils';

const profiles = AuroraDataService.getSocialProfiles();
const posts = AuroraDataService.getSocialPosts();
const channels = AuroraDataService.getSocialChannels();

const profileById = new Map(profiles.map((profile) => [profile.id, profile]));

export function SocialUniverse() {
  return (
    <Surface className="py-8">
      <SurfaceHeader
        title="Social Universe"
        description="One unified social fabric across platforms, communities, and creators."
      />

      <SurfaceSection title="Social Snapshot">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Active Channels" value={channels.length} helper="Community" />
          <StatCard label="Daily Highlights" value={posts.length} helper="Today" />
          <StatCard label="Connected Platforms" value={6} helper="Linked" />
        </div>
      </SurfaceSection>

      <SurfaceSection title="Unified Feed">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                Unified Feed
              </h2>
              <Button variant="secondary">Compose</Button>
            </div>

            <div className="space-y-6" role="list" aria-label="Unified feed">
              {posts.map((post) => {
                const author = profileById.get(post.authorId);
                if (!author) {
                  return null;
                }
                return (
                  <div key={post.id} role="listitem">
                    <SocialPostCard post={post} author={author} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="space-y-3">
              <CardTitle>Trending Topics</CardTitle>
              <div className="flex flex-wrap gap-2" role="list" aria-label="Trending topics">
                {['#aurora', '#realms', '#focus', '#forge', '#learning', '#community'].map((tag) => (
                  <Badge key={tag} role="listitem" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card className="space-y-3">
              <CardTitle>Live Channels</CardTitle>
              <div className="space-y-3" role="list" aria-label="Live channels">
                {channels.map((channel) => (
                  <div key={channel.id} role="listitem" className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {channel.name}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {formatNumber(channel.members)} members
                      </p>
                    </div>
                    <Badge size="sm" variant={channel.isLive ? 'error' : 'default'}>
                      {channel.isLive ? 'Live' : 'Offline'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-3">
              <CardTitle>Creator Spotlight</CardTitle>
              <div className="space-y-2" role="list" aria-label="Creator spotlight">
                {profiles.map((profile) => (
                  <div key={profile.id} role="listitem" className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                      {profile.displayName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {profile.displayName}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {formatNumber(profile.followers)} followers
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </SurfaceSection>
    </Surface>
  );
}
