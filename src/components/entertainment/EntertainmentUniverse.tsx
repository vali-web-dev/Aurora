'use client';

import { Card } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';
import { StatCard } from '@/components/aurora/StatCard';
import { MediaCard } from '@/components/entertainment/MediaCard';
import { PlaylistCard } from '@/components/entertainment/PlaylistCard';
import { AuroraDataService } from '@/data/types';

const mediaItems = AuroraDataService.getMediaItems();
const playlists = AuroraDataService.getPlaylists();

const featured = mediaItems[0];

export function EntertainmentUniverse() {
  return (
    <div className="space-y-8 py-8">
      <div className="space-y-3">
        <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-50">
          Entertainment Universe
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl">
          Every story, every sound, every moment — unified inside Aurora.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Active Providers" value={8} />
        <StatCard label="Curated Playlists" value={playlists.length} />
        <StatCard label="Featured Releases" value={mediaItems.length} />
      </div>

      {/* Featured Spotlight */}
      {featured && (
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
      )}

      {/* Media Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Trending Now
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaItems.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Playlists */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Curated Playlists
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      </div>

      {/* Providers */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Integrated Providers</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['YouTube', 'Netflix', 'Prime Video', 'Spotify', 'Apple Music', 'Twitch', 'Disney+', 'Hulu'].map(
              (provider) => (
                <div
                  key={provider}
                  className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center font-medium text-slate-900 dark:text-slate-50"
                >
                  {provider}
                </div>
              )
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
