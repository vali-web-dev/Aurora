'use client';

import { Card } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';
import { StatCard } from '@/components/aurora/StatCard';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { MediaCard } from '@/components/entertainment/MediaCard';
import { PlaylistCard } from '@/components/entertainment/PlaylistCard';
import { AuroraDataService } from '@/data/types';

const mediaItems = AuroraDataService.getMediaItems();
const playlists = AuroraDataService.getPlaylists();

const featured = mediaItems[0];

export function EntertainmentUniverse() {
  return (
    <Surface className="py-8">
      <SurfaceHeader
        title="Entertainment Universe"
        description="Every story, every sound, every moment — unified inside Aurora."
      />

      <SurfaceSection title="Media Snapshot">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Active Providers" value={8} helper="Connected" />
          <StatCard label="Curated Playlists" value={playlists.length} helper="Handpicked" />
          <StatCard label="Featured Releases" value={mediaItems.length} helper="Available" />
        </div>
      </SurfaceSection>

      {featured && (
        <SurfaceSection title="Featured Spotlight">
          <Card className="bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-900">
            <div className="grid grid-cols-1 md:grid-cols-[1.5fr,1fr] gap-6 items-center">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Featured
                </p>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                  {featured.title}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {featured.provider} • {featured.durationMinutes} min • ★ {featured.rating.toFixed(1)}
                </p>
                <div className="flex gap-3">
                  <Button variant="primary">Play Now</Button>
                  <Button variant="secondary">Add to Watchlist</Button>
                </div>
              </div>
              <div
                className="h-48 rounded-xl bg-cover bg-center"
                style={{ backgroundImage: `url(${featured.imageUrl})` }}
              />
            </div>
          </Card>
        </SurfaceSection>
      )}

      <SurfaceSection title="Trending Now">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Trending media">
          {mediaItems.map((item) => (
            <div key={item.id} role="listitem">
              <MediaCard item={item} />
            </div>
          ))}
        </div>
      </SurfaceSection>

      <SurfaceSection title="Curated Playlists">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" role="list" aria-label="Curated playlists">
          {playlists.map((playlist) => (
            <div key={playlist.id} role="listitem">
              <PlaylistCard playlist={playlist} />
            </div>
          ))}
        </div>
      </SurfaceSection>

      <SurfaceSection title="Integrated Providers">
        <Card>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="list" aria-label="Integrated providers">
            {['YouTube', 'Netflix', 'Prime Video', 'Spotify', 'Apple Music', 'Twitch', 'Disney+', 'Hulu'].map(
              (provider) => (
                <div
                  key={provider}
                  role="listitem"
                  className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center font-medium text-slate-900 dark:text-slate-50"
                >
                  {provider}
                </div>
              )
            )}
          </div>
        </Card>
      </SurfaceSection>
    </Surface>
  );
}
