'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardDescription } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';
import { onEvent } from '@/lib/websocket-client';
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

interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: Date | string;
  author?: {
    id: string;
    name: string;
  };
}

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface SocialPostCardProps {
  post: Post;
  onUpdate?: (post: Post) => void;
  onDelete?: (postId: number) => void;
}

export function SocialPostCard({ post, onUpdate, onDelete }: SocialPostCardProps) {
  const { data: session } = useSession();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLoadingReactions, setIsLoadingReactions] = useState(false);

  const isOwnPost = session?.user?.id && post.authorUserId.toString() === session.user.id;

  // Format date
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  // Fetch comments when expanded
  useEffect(() => {
    if (showComments && comments.length === 0) {
      fetchComments();
    }
  }, [showComments]);

  // Fetch reactions on mount
  useEffect(() => {
    fetchReactions();
  }, [post.id]);

  // Listen for real-time comment updates
  useEffect(() => {
    const unsubscribe = onEvent(WSEventType.POST_COMMENT, (data: any) => {
      if (data.postId === post.id && data.action !== 'delete') {
        setComments((prev) => [...prev, data]);
      } else if (data.action === 'delete') {
        setComments((prev) => prev.filter((c) => c.id !== data.id));
      }
    });

    return () => unsubscribe();
  }, [post.id]);

  // Listen for real-time reaction updates
  useEffect(() => {
    const unsubscribe = onEvent(WSEventType.POST_REACTION, (data: any) => {
      if (data.postId === post.id) {
        fetchReactions();
      }
    });

    return () => unsubscribe();
  }, [post.id]);

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const response = await fetch(`/api/social/comments?postId=${post.id}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const fetchReactions = async () => {
    setIsLoadingReactions(true);
    try {
      const response = await fetch(`/api/social/reactions?postId=${post.id}`);
      if (response.ok) {
        const data = await response.json();
        const summary = data.summary || {};
        const userReactions = data.reactions
          .filter((r: any) => r.userId.toString() === session?.user?.id)
          .map((r: any) => r.emoji);

        setReactions(
          Object.entries(summary).map(([emoji, count]) => ({
            emoji,
            count: count as number,
            userReacted: userReactions.includes(emoji),
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setIsLoadingReactions(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch('/api/social/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          content: newComment,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments((prev) => [...prev, data.comment]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReaction = async (emoji: string) => {
    const reaction = reactions.find((r) => r.emoji === emoji);
    const alreadyReacted = reaction?.userReacted;

    try {
      if (alreadyReacted) {
        // Remove reaction
        await fetch(`/api/social/reactions?postId=${post.id}&emoji=${emoji}`, {
          method: 'DELETE',
        });
      } else {
        // Add reaction
        await fetch('/api/social/reactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId: post.id,
            emoji,
          }),
        });
      }
      // Reactions will update via WebSocket
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/social/feed?postId=${post.id}`, {
        method: 'DELETE',
      });

      if (response.ok && onDelete) {
        onDelete(post.id);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const authorName = post.author?.name || 'Unknown User';
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <Card className="space-y-4">
      {/* Author Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
            {authorInitial}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-50">
              {authorName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatDate(post.createdAt)}
            </p>
          </div>
        </div>
        {isOwnPost && (
          <Button variant="ghost" size="sm" onClick={handleDeletePost}>
            🗑️
          </Button>
        )}
      </div>

      {/* Content */}
      <CardDescription className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
        {post.content}
      </CardDescription>

      {/* Reactions */}
      <div className="flex items-center gap-2 flex-wrap">
        {['❤️', '👍', '😂', '🎉', '🤔'].map((emoji) => {
          const reaction = reactions.find((r) => r.emoji === emoji);
          const count = reaction?.count || 0;
          const userReacted = reaction?.userReacted || false;

          return (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                userReacted
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-2 border-blue-500'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {emoji} {count > 0 && count}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
        >
          💬 {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          {isLoadingComments ? (
            <p className="text-sm text-slate-500">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-slate-500">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {comment.author?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-50">
                      {comment.author?.name || 'Unknown User'}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {session?.user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                disabled={isSubmittingComment}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddComment}
                disabled={!newComment.trim() || isSubmittingComment}
              >
                {isSubmittingComment ? '...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
