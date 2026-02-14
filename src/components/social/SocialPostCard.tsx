'use client';

import { useState, useEffect, useRef } from 'react';
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
  parentCommentId?: number | null;
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
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [commentReactions, setCommentReactions] = useState<Record<number, Reaction[]>>({});
  const [isLoadingCommentReactions, setIsLoadingCommentReactions] = useState<Record<number, boolean>>({});
  const commentInputRef = useRef<HTMLInputElement | null>(null);
  const replyInputRef = useRef<HTMLInputElement | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<number, boolean>>({});
  const [showAllComments, setShowAllComments] = useState(false);
  const [collapsedThreads, setCollapsedThreads] = useState<Record<number, boolean>>({});
  const topLevelVisibleCount = 3;
  const replyVisibleCount = 2;

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

  useEffect(() => {
    if (!showComments) return;
    const handle = setTimeout(() => {
      commentInputRef.current?.focus();
    }, 0);
    return () => clearTimeout(handle);
  }, [showComments]);

  useEffect(() => {
    if (!replyingTo) return;
    const handle = setTimeout(() => {
      replyInputRef.current?.focus();
    }, 0);
    return () => clearTimeout(handle);
  }, [replyingTo]);

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
        const nextComments = data.comments || [];
        setComments(nextComments);
        await loadCommentReactions(nextComments);
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
        setReactions(buildReactionSummary(data.reactions || [], data.summary || {}));
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setIsLoadingReactions(false);
    }
  };

  const buildReactionSummary = (allReactions: any[], summary: Record<string, number>) => {
    const userReactions = allReactions
      .filter((r: any) => r.userId.toString() === session?.user?.id)
      .map((r: any) => r.emoji);

    return Object.entries(summary).map(([emoji, count]) => ({
      emoji,
      count: count as number,
      userReacted: userReactions.includes(emoji),
    }));
  };

  const fetchCommentReactions = async (commentId: number) => {
    setIsLoadingCommentReactions((prev) => ({ ...prev, [commentId]: true }));
    try {
      const response = await fetch(`/api/social/comment-reactions?commentId=${commentId}`);
      if (response.ok) {
        const data = await response.json();
        setCommentReactions((prev) => ({
          ...prev,
          [commentId]: buildReactionSummary(data.reactions || [], data.summary || {}),
        }));
      }
    } catch (error) {
      console.error('Error fetching comment reactions:', error);
    } finally {
      setIsLoadingCommentReactions((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const loadCommentReactions = async (commentList: Comment[]) => {
    const missing = commentList.filter((comment) => !commentReactions[comment.id]);
    await Promise.all(missing.map((comment) => fetchCommentReactions(comment.id)));
  };

  useEffect(() => {
    if (comments.length === 0) return;
    loadCommentReactions(comments);
  }, [comments.length]);

  const handleAddComment = async (content: string, parentCommentId?: number | null) => {
    if (!content.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch('/api/social/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          content,
          parentCommentId: parentCommentId ?? undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments((prev) => [...prev, data.comment]);
        if (parentCommentId) {
          setCollapsedThreads((prev) => ({ ...prev, [parentCommentId]: false }));
          setExpandedReplies((prev) => ({ ...prev, [parentCommentId]: true }));
          setReplyContent('');
          setReplyingTo(null);
        } else {
          setNewComment('');
        }
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
      await fetchReactions();
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  const handleCommentReaction = async (commentId: number, emoji: string) => {
    const reaction = commentReactions[commentId]?.find((r) => r.emoji === emoji);
    const alreadyReacted = reaction?.userReacted;

    try {
      if (alreadyReacted) {
        await fetch(`/api/social/comment-reactions?commentId=${commentId}&emoji=${emoji}`, {
          method: 'DELETE',
        });
      } else {
        await fetch('/api/social/comment-reactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            commentId,
            emoji,
          }),
        });
      }
      await fetchCommentReactions(commentId);
    } catch (error) {
      console.error('Error toggling comment reaction:', error);
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
  const topLevelComments = comments.filter((comment) => !comment.parentCommentId);
  const repliesByParent = comments.reduce<Record<number, Comment[]>>((acc, comment) => {
    if (comment.parentCommentId) {
      acc[comment.parentCommentId] = acc[comment.parentCommentId] || [];
      acc[comment.parentCommentId].push(comment);
    }
    return acc;
  }, {});

  const renderCommentThread = (comment: Comment, depth: number = 0) => {
    const commentAuthor = comment.author?.name || 'Unknown User';
    const commentInitial = commentAuthor.charAt(0).toUpperCase();
    const commentReplyList = repliesByParent[comment.id] || [];
    const isExpanded = expandedReplies[comment.id] ?? false;
    const isCollapsed = collapsedThreads[comment.id] ?? (commentReplyList.length > 0);
    const visibleReplies = isExpanded
      ? commentReplyList
      : commentReplyList.slice(0, replyVisibleCount);
    const reactionsForComment = commentReactions[comment.id] || [];
    const isReplyingHere = replyingTo === comment.id;
    const containerClass = depth > 0
      ? 'flex gap-3 pl-6 border-l border-slate-200 dark:border-slate-700'
      : 'flex gap-3';
    const avatarClass = depth > 0
      ? 'h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0'
      : 'h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0';
    const cardClass = depth > 0
      ? 'bg-white/70 dark:bg-slate-900/70 rounded-lg p-3 border border-slate-200/60 dark:border-slate-700/60'
      : 'bg-slate-50 dark:bg-slate-800 rounded-lg p-3';
    const nameClass = depth > 0
      ? 'font-semibold text-[11px] uppercase tracking-wide text-slate-700 dark:text-slate-300'
      : 'font-semibold text-xs uppercase tracking-wide text-slate-600 dark:text-slate-400';
    const bodyClass = depth > 0
      ? 'text-[13px] leading-relaxed text-slate-800 dark:text-slate-200'
      : 'text-[15px] leading-relaxed text-slate-900 dark:text-slate-50';
    const metaClass = depth > 0
      ? 'text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'
      : 'text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400';
    const reactionButtonClass = depth > 0
      ? 'px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors'
      : 'px-2.5 py-1 rounded-full text-xs font-medium transition-colors';
    const totalReactions = reactionsForComment.reduce((sum, reaction) => sum + reaction.count, 0);

    return (
      <div key={comment.id} className="space-y-2">
        <div className={containerClass}>
          <div className={avatarClass}>
            {commentInitial}
          </div>
          <div className="flex-1 space-y-2">
            <div className={cardClass}>
              <p className={nameClass}>{commentAuthor}</p>
              <p className={`${bodyClass} mt-1`}>
                {comment.content}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-3 ${metaClass}`}>
                <span>{formatDate(comment.createdAt)}</span>
                <button
                  className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200"
                  onClick={() => {
                    setReplyingTo(comment.id);
                    setReplyContent('');
                  }}
                >
                  Reply
                </button>
              </div>
              <button
                type="button"
                className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
                onClick={() => handleCommentReaction(comment.id, '❤️')}
                disabled={isLoadingCommentReactions[comment.id]}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path
                    d="M12 21s-7-4.35-9.5-8.5C.5 9.5 2 7 4.8 6.4c2-.4 3.6.5 4.5 1.7.9-1.2 2.5-2.1 4.5-1.7C16.6 7 18 9.5 21.5 12.5 19 16.65 12 21 12 21z"
                  />
                </svg>
                {totalReactions > 0 && <span>{totalReactions}</span>}
              </button>
            </div>

            {commentReplyList.length > 0 && (
              <button
                type="button"
                className="group flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
                onClick={() =>
                  setCollapsedThreads((prev) => ({
                    ...prev,
                    [comment.id]: !isCollapsed,
                  }))
                }
                aria-expanded={!isCollapsed}
              >
                <span className="h-px w-6 bg-slate-300 dark:bg-slate-700" />
                <span>
                  {isCollapsed
                    ? `View ${commentReplyList.length} repl${commentReplyList.length === 1 ? 'y' : 'ies'}`
                    : 'Hide replies'}
                </span>
                <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                  {isCollapsed ? 'v' : '^'}
                </span>
              </button>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {['❤️', '👍', '😂', '🎉', '🤔'].map((emoji) => {
                const reaction = reactionsForComment.find((r) => r.emoji === emoji);
                const count = reaction?.count || 0;
                const userReacted = reaction?.userReacted || false;

                return (
                  <button
                    key={emoji}
                    onClick={() => handleCommentReaction(comment.id, emoji)}
                    disabled={isLoadingCommentReactions[comment.id]}
                    className={`${reactionButtonClass} ${
                      userReacted
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {emoji} {count > 0 && count}
                  </button>
                );
              })}
            </div>

            {isReplyingHere && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    ref={replyInputRef}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment(replyContent, comment.id);
                      }
                    }}
                    disabled={isSubmittingComment}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAddComment(replyContent, comment.id)}
                    disabled={!replyContent.trim() || isSubmittingComment}
                  >
                    {isSubmittingComment ? '...' : 'Reply'}
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 px-2 py-1 hover:text-slate-900 dark:hover:text-slate-50"
                  >
                    @ Tag
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 px-2 py-1 hover:text-slate-900 dark:hover:text-slate-50"
                  >
                    :) Emoji
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 px-2 py-1 hover:text-slate-900 dark:hover:text-slate-50"
                  >
                    ... More
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {commentReplyList.length > 0 && !isCollapsed && (
          <div className="space-y-3 transition-opacity duration-200">
            {visibleReplies.map((reply) => renderCommentThread(reply, depth + 1))}
            {commentReplyList.length > replyVisibleCount && (
              <button
                type="button"
                className="group flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
                onClick={() =>
                  setExpandedReplies((prev) => ({
                    ...prev,
                    [comment.id]: !isExpanded,
                  }))
                }
                aria-expanded={isExpanded}
              >
                <span className="h-px w-6 bg-slate-300 dark:bg-slate-700" />
                <span>
                  {isExpanded
                    ? 'Collapse replies'
                    : `View ${commentReplyList.length - replyVisibleCount} more repl${
                        commentReplyList.length - replyVisibleCount === 1 ? 'y' : 'ies'
                      }`}
                </span>
                <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                  {isExpanded ? '^' : 'v'}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

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
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="relative max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-4 pb-28">
              {isLoadingComments ? (
                <p className="text-sm text-slate-500">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-sm text-slate-500">No comments yet. Be the first!</p>
              ) : (
                <div className="space-y-4">
                  {(showAllComments
                    ? topLevelComments
                    : topLevelComments.slice(0, topLevelVisibleCount)
                  ).map((comment) => renderCommentThread(comment))}
                  {topLevelComments.length > topLevelVisibleCount && (
                    <button
                      type="button"
                      className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50"
                      onClick={() => setShowAllComments((prev) => !prev)}
                      aria-expanded={showAllComments}
                    >
                      {showAllComments
                        ? 'Collapse comments'
                        : `View ${topLevelComments.length - topLevelVisibleCount} more comment${
                            topLevelComments.length - topLevelVisibleCount === 1 ? '' : 's'
                          }`}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Sticky Add Comment */}
            <div className="sticky bottom-0 z-10">
              <div className="flex gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 p-3 shadow-lg backdrop-blur">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {session?.user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      ref={commentInputRef}
                      data-no-autofocus="true"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment(newComment);
                        }
                      }}
                      disabled={isSubmittingComment}
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAddComment(newComment)}
                      disabled={!newComment.trim() || isSubmittingComment}
                    >
                      {isSubmittingComment ? '...' : 'Send'}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 px-2 py-1 hover:text-slate-900 dark:hover:text-slate-50"
                    >
                      @ Tag
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 px-2 py-1 hover:text-slate-900 dark:hover:text-slate-50"
                    >
                      :) Emoji
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 px-2 py-1 hover:text-slate-900 dark:hover:text-slate-50"
                    >
                      ... More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
