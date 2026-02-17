'use client';

import { Card, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/aurora/StatCard';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { AuroraDataService } from '@/data/types';
import { formatDateTime } from '@/lib/utils';

// See AURORA_MANUAL.md § The 15 Universes: Gaming Universe.
// See AURORA_QUICK_REFERENCE.md § 15 Universes at a Glance.
const games = AuroraDataService.getGames();
const clips = AuroraDataService.getGameClips();
const tournaments = AuroraDataService.getGameTournaments();
const leaders = AuroraDataService.getGameLeaderboards();

const totalHours = games.reduce((sum, game) => sum + game.hoursPlayed, 0);
const liveTournaments = tournaments.filter((tourney) => tourney.status === 'live').length;
const activeGames = games.filter((game) => game.status === 'playing').length;

const platformLabel: Record<string, string> = {
  pc: 'PC',
  console: 'Console',
  cloud: 'Cloud',
  mobile: 'Mobile',
};

export function GamingUniverse() {
  return (
    <Surface className="py-8">
      <SurfaceHeader
        title="Gaming Universe"
        description="Track your library, share highlights, and join live competitions."
        actions={<Button variant="primary">Open Game Hub</Button>}
      />

      <SurfaceSection title="Gaming Snapshot">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Active Games" value={activeGames} helper="Playing now" />
          <StatCard label="Hours Played" value={totalHours} helper="Lifetime" />
          <StatCard label="Live Tournaments" value={liveTournaments} helper="Right now" />
        </div>
      </SurfaceSection>

      <SurfaceSection title="Game Library" description="Your connected libraries across platforms.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" role="list" aria-label="Game library">
          {games.map((game) => (
            <Card key={game.id} role="listitem" className="space-y-2">
              <p className="aurora-label text-slate-500 dark:text-slate-400">{platformLabel[game.platform]}</p>
              <CardTitle className="text-base">{game.title}</CardTitle>
              <div className="flex items-center justify-between">
                <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">{game.hoursPlayed}h played</p>
                <Badge size="sm" variant={game.status === 'playing' ? 'success' : game.status === 'queued' ? 'warning' : 'default'}>
                  {game.status}
                </Badge>
              </div>
              <p className="aurora-label text-xs text-slate-500 dark:text-slate-500">Last played {formatDateTime(game.lastPlayedAt)}</p>
            </Card>
          ))}
        </div>
      </SurfaceSection>

      <SurfaceSection title="Clips & Highlights" description="Recent moments saved across your sessions.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="list" aria-label="Game clips">
          {clips.map((clip) => (
            <Card key={clip.id} role="listitem" className="space-y-2">
              <CardTitle className="text-base">{clip.title}</CardTitle>
              <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">{clip.durationSeconds}s</p>
              <div className="flex flex-wrap gap-2">
                {clip.highlights.map((tag) => (
                  <Badge key={tag} size="sm" variant="info">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="aurora-label text-xs text-slate-500 dark:text-slate-500">Saved {formatDateTime(clip.createdAt)}</p>
            </Card>
          ))}
        </div>
      </SurfaceSection>

      <SurfaceSection title="Events & Tournaments" description="Compete, watch, and celebrate community play.">
        <Card className="space-y-3">
          {tournaments.map((tourney) => (
            <div key={tourney.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
              <div>
                <p className="aurora-label text-slate-900 dark:text-slate-50">{tourney.title}</p>
                <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                  {formatDateTime(tourney.startsAt)} · {tourney.participants} players
                </p>
              </div>
              <Badge size="sm" variant={tourney.status === 'live' ? 'success' : tourney.status === 'upcoming' ? 'info' : 'default'}>
                {tourney.status}
              </Badge>
            </div>
          ))}
        </Card>
      </SurfaceSection>

      <SurfaceSection title="Leaderboards" description="See who is leading the top arenas.">
        <Card className="space-y-3">
          {leaders.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <Badge size="sm" variant="default">#{entry.rank}</Badge>
                <div>
                  <p className="aurora-label text-slate-900 dark:text-slate-50">{entry.player}</p>
                  <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">Score {entry.score}</p>
                </div>
              </div>
              <Badge size="sm" variant={entry.change === 'up' ? 'success' : entry.change === 'down' ? 'warning' : 'default'}>
                {entry.change}
              </Badge>
            </div>
          ))}
        </Card>
      </SurfaceSection>
    </Surface>
  );
}
