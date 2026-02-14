import { Card, CardDescription, CardFooter } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/aurora/Button';
import type { SocialPost, SocialProfile } from '@/data/types';
import { formatNumber } from '@/lib/utils';

interface SocialPostCardProps {
  post: SocialPost;
  author: SocialProfile;
}

const platformLabel = (platform: SocialPost['platform']) => {
  switch (platform) {
    case 'instagram':
      return 'Instagram';
    case 'tiktok':
      return 'TikTok';
    case 'x':
      return 'X';
    case 'reddit':
      return 'Reddit';
    case 'linkedin':
      return 'LinkedIn';
    default:
      return 'Aurora';
  }
};

export function SocialPostCard({ post, author }: SocialPostCardProps) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
            {author.displayName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900 dark:text-slate-50">
                {author.displayName}
              </p>
              {author.verified && <span className="text-blue-500">✔</span>}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              @{author.handle}
            </p>
          </div>
        </div>
        <Badge variant="info" size="sm">
          {platformLabel(post.platform)}
        </Badge>
      </div>

      <CardDescription className="text-slate-700 dark:text-slate-300">
        {post.body}
      </CardDescription>

      {post.mediaType && (
        <div className="h-40 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <span className="text-4xl">
            {post.mediaType === 'video' ? '🎬' : post.mediaType === 'image' ? '🖼️' : '🔗'}
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <Badge key={tag} size="sm">
            #{tag}
          </Badge>
        ))}
      </div>

      <CardFooter className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
        <div className="flex gap-4">
          <span>❤ {formatNumber(post.likes)}</span>
          <span>💬 {formatNumber(post.comments)}</span>
        </div>
        <Button variant="ghost" size="sm">
          Open
        </Button>
      </CardFooter>
    </Card>
  );
}
