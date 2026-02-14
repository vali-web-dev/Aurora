'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/aurora/Button';
import { StatCard } from '@/components/aurora/StatCard';
import { SocialPostCard } from '@/components/social/SocialPostCard';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { initializeSocket, disconnectSocket, subscribeFeed, onEvent } from '@/lib/websocket-client';
import { WSEventType } from '@/lib/websocket-types';

interface Post {
  id: number;
  authorUserId: number;
  universe: string;
  content: string;
  visibility: string;
  metadata: any;
  createdAt: Date | string;
  updatedAt: Date | string;
  author?: {
    id: string;
    name: string;
    email: string;
  };
}

export function SocialUniverse() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComposing, setIsComposing] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch feed data
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await fetch('/api/social/feed?universe=social&limit=20');
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts || []);
        }
      } catch (error) {
        console.error('Error fetching feed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchFeed();
    }
  }, [session]);

  // WebSocket real-time updates
  useEffect(() => {
    if (!session) return;

    initializeSocket();
    subscribeFeed('social');

    // Listen for new posts
    const unsubscribeCreate = onEvent(WSEventType.POST_CREATE, (data: any) => {
      setPosts((prev) => [data, ...prev]);
    });

    // Listen for post updates
    const unsubscribeUpdate = onEvent(WSEventType.POST_UPDATE, (data: any) => {
      setPosts((prev) =>
        prev.map((post) => (post.id === data.id ? { ...post, ...data } : post))
      );
    });

    // Listen for post deletes
    const unsubscribeDelete = onEvent(WSEventType.POST_DELETE, (data: any) => {
      setPosts((prev) => prev.filter((post) => post.id !== data.id));
    });

    return () => {
      unsubscribeCreate();
      unsubscribeUpdate();
      unsubscribeDelete();
      disconnectSocket();
    };
  }, [session]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || isSubmitting) return;

    console.log('[SocialUniverse] Creating post with content:', newPostContent);
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/social/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newPostContent,
          universe: 'social',
          visibility: 'public',
        }),
      });

      console.log('[SocialUniverse] Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[SocialUniverse] Post created successfully:', data);
        
        // Add the new post to the feed
        setPosts((prev) => [data.post, ...prev]);
        setNewPostContent('');
        setIsComposing(false);
      } else {
        const errorData = await response.json();
        console.error('[SocialUniverse] Failed to create post:', errorData);
        alert(`Failed to create post: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[SocialUniverse] Error creating post:', error);
      alert('Error creating post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <Surface className="py-8">
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">
            Please sign in to view the Social Universe
          </p>
        </div>
      </Surface>
    );
  }

  return (
    <Surface className="py-8">
      <SurfaceHeader
        title="Social Universe"
        description="One unified social fabric across platforms, communities, and creators."
      />

      <SurfaceSection title="Social Snapshot">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total Posts" value={posts.length} helper="In Feed" />
          <StatCard label="Connected" value={session ? '✓' : '✗'} helper="Real-time" />
          <StatCard label="Universe" value="Social" helper="Active" />
        </div>
      </SurfaceSection>

      <SurfaceSection title="Unified Feed">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                Unified Feed
              </h2>
              <Button
                variant="primary"
                onClick={() => setIsComposing(!isComposing)}
              >
                {isComposing ? 'Cancel' : 'Compose'}
              </Button>
            </div>

            {isComposing && (
              <Card className="space-y-4">
                <textarea
                  className="w-full min-h-32 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="What's on your mind?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  disabled={isSubmitting}
                />
                <div className="flex justify-end gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsComposing(false);
                      setNewPostContent('');
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim() || isSubmitting}
                  >
                    {isSubmitting ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </Card>
            )}

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-48 animate-pulse bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-slate-600 dark:text-slate-400">
                  No posts yet. Be the first to share something!
                </p>
              </Card>
            ) : (
              <div className="space-y-6" role="list" aria-label="Unified feed">
                {posts.map((post) => (
                  <div key={post.id} role="listitem">
                    <SocialPostCard
                      post={post}
                      onUpdate={(updatedPost) => {
                        setPosts((prev) =>
                          prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
                        );
                      }}
                      onDelete={(postId) => {
                        setPosts((prev) => prev.filter((p) => p.id !== postId));
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="space-y-3">
              <CardTitle>Trending Topics</CardTitle>
              <div className="flex flex-wrap gap-2" role="list" aria-label="Trending topics">
                {['#aurora', '#realms', '#focus', '#forge', '#learning', '#community'].map((tag) => (
                  <Badge key={tag} role="listitem" size="sm" variant="info">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card className="space-y-3">
              <CardTitle>Quick Actions</CardTitle>
              <div className="space-y-2">
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  📝 Create Post
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  👥 Find Friends
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  🔔 Notifications
                </Button>
              </div>
            </Card>

            <Card className="space-y-3">
              <CardTitle>Your Profile</CardTitle>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                  {session?.user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-50">
                    {session?.user?.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </SurfaceSection>
    </Surface>
  );
}
