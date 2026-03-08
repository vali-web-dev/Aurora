'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { emitEvent, onEvent } from '@/lib/websocket-client';
import { WSEventType } from '@/lib/websocket-types';
import { TypingIndicator } from '@/components/realtime/NotificationCenter';

interface TypingUser {
  userId: string;
  postId: number;
  userName: string;
  timestamp: number;
}

interface SocialFeedRealtimeProps {
  postId: number;
  children?: React.ReactNode;
}

/**
 * Manages real-time typing indicators for social posts.
 * Shows "X is typing..." when other users are composing comments.
 */
export function SocialFeedRealtime({ postId, children }: SocialFeedRealtimeProps) {
  const { data: session } = useSession();
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());
  const typingChannelRef = useRef<string>(`post:${postId}:typing`);

  // Listen for typing indicators
  useEffect(() => {
    if (!session) return;

    const unsubscribeTyping = onEvent(WSEventType.TYPING_INDICATOR, (data: any) => {
      if (data.postId !== postId) return;
      if (data.userId === session.user?.id) return; // Ignore own typing

      const key = `${data.userId}:${postId}`;
      setTypingUsers((prev) => {
        const next = new Map(prev);

        if (data.isTyping === false) {
          next.delete(key);
          return next;
        }

        next.set(key, {
          userId: data.userId,
          postId,
          userName: data.userName || 'User',
          timestamp: Date.now(),
        });
        return next;
      });

      // Auto-remove typing indicator after 3 seconds of inactivity
      setTimeout(() => {
        setTypingUsers((prev) => {
          const candidate = prev.get(key);
          if (!candidate || Date.now() - candidate.timestamp <= 3000) {
            return prev;
          }
          const next = new Map(prev);
          next.delete(key);
          return next;
        });
      }, 3100);
    });

    return () => {
      unsubscribeTyping();
    };
  }, [session, postId]);

  const typingUsersList = Array.from(typingUsers.values()).map((u) => u.userName);

  return (
    <div className="space-y-2">
      {children}
      {typingUsersList.length > 0 && (
        <div className="pl-4 py-2">
          <TypingIndicator users={typingUsersList} />
        </div>
      )}
    </div>
  );
}

/**
 * Hook for managing typing indicator broadcasts.
 * Call this when user is typing a comment.
 */
export function useCommentTyping(postId: number) {
  const { data: session } = useSession();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const broadcastTyping = useCallback(() => {
    if (!session) return;

    emitEvent(WSEventType.TYPING_INDICATOR, {
      postId,
      userId: session.user?.id,
      userName: session.user?.name || 'User',
      isTyping: true,
      timestamp: Date.now(),
    });

    // Debounce: clear existing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Set new timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      emitEvent(WSEventType.TYPING_INDICATOR, {
        postId,
        userId: session.user?.id,
        userName: session.user?.name || 'User',
        isTyping: false,
      });
    }, 2000);
  }, [session, postId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return broadcastTyping;
}
