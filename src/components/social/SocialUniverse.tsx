'use client';

import { Card } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';
import { StatCard } from '@/components/aurora/StatCard';
import { SocialPostCard } from '@/components/social/SocialPostCard';
import { AuroraDataService } from '@/data/types';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';

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
          <StatCard label="Active Channels" value={channels.length} />
          <StatCard label="Daily Highlights" value={posts.length} />
          <StatCard label="Connected Platforms" value={6} />
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

            <div className="space-y-6">
              {posts.map((post) => {
                const author = profileById.get(post.authorId);
                if (!author) {
                  return null;
                }
                return <SocialPostCard key={post.id} post={post} author={author} />;
              })}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Trending Topics</h3>
              <div className="flex flex-wrap gap-2">
                {['#aurora', '#realms', '#focus', '#forge', '#learning', '#community'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Live Channels</h3>
              <div className="space-y-3">
                {channels.map((channel) => (
                  <div key={channel.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {channel.name}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {channel.members.toLocaleString()} members
                      </p>
                    </div>
                    {channel.isLive ? (
                      <span className="text-xs font-semibold text-red-500">LIVE</span>
                    ) : (
                      <span className="text-xs text-slate-500">Offline</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Creator Spotlight</h3>
              <div className="space-y-2">
                {profiles.map((profile) => (
                  <div key={profile.id} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                      {profile.displayName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {profile.displayName}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {profile.followers.toLocaleString()} followers
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
