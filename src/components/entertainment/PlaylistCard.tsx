import { Card, CardDescription, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import type { Playlist } from '@/data/types';

interface PlaylistCardProps {
  playlist: Playlist;
}

const moodVariant: Record<Playlist['mood'], 'default' | 'primary' | 'success' | 'warning' | 'info'> = {
  focus: 'info',
  energize: 'warning',
  calm: 'success',
  deep: 'primary',
  joy: 'default',
};

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <Card hoverable className="space-y-3">
      <div
        className="h-28 rounded-lg bg-slate-100 dark:bg-slate-800 bg-cover bg-center"
        style={{ backgroundImage: `url(${playlist.coverUrl})` }}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant={moodVariant[playlist.mood]} size="sm">
            {playlist.mood}
          </Badge>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {playlist.items.length} items
          </span>
        </div>

        <CardTitle>{playlist.title}</CardTitle>
        <CardDescription className="text-xs">
          {playlist.description}
        </CardDescription>
      </div>
    </Card>
  );
}
