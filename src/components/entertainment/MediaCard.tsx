import { Card } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import type { MediaItem } from '@/data/types';

interface MediaCardProps {
  item: MediaItem;
}

const typeLabel = (type: MediaItem['type']) => {
  switch (type) {
    case 'audio':
      return 'Audio';
    case 'podcast':
      return 'Podcast';
    case 'live':
      return 'Live';
    default:
      return 'Video';
  }
};

export function MediaCard({ item }: MediaCardProps) {
  return (
    <Card hoverable className="space-y-3">
      <div
        className="h-40 rounded-lg bg-slate-100 dark:bg-slate-800 bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${item.imageUrl})` }}
      >
        <div className="text-4xl">{item.type === 'audio' ? '🎧' : item.type === 'live' ? '📡' : '🎬'}</div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant={item.type === 'live' ? 'error' : 'primary'} size="sm">
            {typeLabel(item.type)}
          </Badge>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {item.provider}
          </span>
        </div>

        <h3 className="font-semibold text-slate-900 dark:text-slate-50">
          {item.title}
        </h3>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{item.durationMinutes} min</span>
          <span>★ {item.rating.toFixed(1)}</span>
        </div>
      </div>
    </Card>
  );
}
