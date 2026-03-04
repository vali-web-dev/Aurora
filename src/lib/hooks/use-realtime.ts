'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { initializeSocket, authenticateSocket, getSocket } from '@/lib/websocket-client';
import { WSEventType, WSMessage } from '@/lib/websocket-types';
import { Socket } from 'socket.io-client';

/**
 * Hook to initialize WebSocket connection and handle authentication
 */
export function useWebSocket() {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    // Initialize socket
    const socket = initializeSocket();
    socketRef.current = socket;

    // Handle connection
    const handleConnect = async () => {
      console.log('[WebSocket] Connected, authenticating...');

      const sessionId = `session-${session.expires ?? Date.now()}`;
      const userId = session.user.email ?? session.user.name ?? `user-${Date.now()}`;
      const sessionToken = `token-${session.expires ?? Date.now()}`;

      // Authenticate with session data
      const authenticated = await authenticateSocket(
        sessionId,
        userId,
        sessionToken
      );

      if (authenticated) {
        setIsConnected(true);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', () => setIsConnected(false));

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect');
    };
  }, [session]);

  return {
    socket: socketRef.current,
    isConnected,
  };
}

/**
 * Hook to listen for notifications
 */
export function useNotifications() {
  const socket = getSocket();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!socket?.connected) return;

    // Listen for new notifications
    const handleNotification = (notification: any) => {
      setNotifications((prev) => [notification, ...prev]);
      if (!notification.read) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    // Listen for notification read
    const handleNotificationRead = (data: any) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === data.notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    // Listen for clear all
    const handleNotificationsCleared = () => {
      setNotifications([]);
      setUnreadCount(0);
    };

    socket.on(WSEventType.NOTIFICATION, handleNotification);
    socket.on('notification:read', handleNotificationRead);
    socket.on('notifications:cleared', handleNotificationsCleared);

    return () => {
      socket.off(WSEventType.NOTIFICATION, handleNotification);
      socket.off('notification:read', handleNotificationRead);
      socket.off('notifications:cleared', handleNotificationsCleared);
    };
  }, [socket]);

  const markAsRead = useCallback(
    (notificationId: string) => {
      socket?.emit('notification:read', { notificationId });
    },
    [socket]
  );

  const clearAll = useCallback(() => {
    socket?.emit('notifications:clear');
  }, [socket]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearAll,
  };
}

/**
 * Hook to track presence (online/offline/idle status)
 */
export function usePresence(options?: { universe?: string }) {
  const socket = getSocket();
  const [presence, setPresence] = useState<any[]>([]);
  const [currentUserStatus, setCurrentUserStatus] = useState<string>('online');

  useEffect(() => {
    if (!socket?.connected) return;

    // Listen for presence updates
    const handlePresenceUpdate = (data: any) => {
      setPresence((prev) => {
        const exists = prev.find((p) => p.userId === data.userId);
        if (exists) {
          return prev.map((p) =>
            p.userId === data.userId ? data : p
          );
        }
        return [...prev, data];
      });
    };

    const handlePresenceOnline = (data: any) => {
      setPresence((prev) => {
        const exists = prev.find((p) => p.userId === data.userId);
        if (!exists) {
          return [...prev, { userId: data.userId, status: 'online' }];
        }
        return prev;
      });
    };

    const handlePresenceOffline = (data: any) => {
      setPresence((prev) => prev.filter((p) => p.userId !== data.userId));
    };

    socket.on(WSEventType.PRESENCE_UPDATE, handlePresenceUpdate);
    socket.on(WSEventType.PRESENCE_ONLINE, handlePresenceOnline);
    socket.on(WSEventType.PRESENCE_OFFLINE, handlePresenceOffline);

    // Emit initial presence
    socket.emit(WSEventType.PRESENCE_UPDATE, {
      status: currentUserStatus,
      universe: options?.universe,
    });

    return () => {
      socket.off(WSEventType.PRESENCE_UPDATE, handlePresenceUpdate);
      socket.off(WSEventType.PRESENCE_ONLINE, handlePresenceOnline);
      socket.off(WSEventType.PRESENCE_OFFLINE, handlePresenceOffline);
    };
  }, [socket, options?.universe, currentUserStatus]);

  const setStatus = useCallback(
    (status: string) => {
      setCurrentUserStatus(status);
      socket?.emit(WSEventType.PRESENCE_UPDATE, {
        status,
        universe: options?.universe,
      });
    },
    [socket, options?.universe]
  );

  return {
    onlineUsers: presence.filter((p) => p.status === 'online'),
    presence,
    currentStatus: currentUserStatus,
    setStatus,
  };
}

/**
 * Hook to listen for real-time feed updates (social, notifications, etc.)
 */
export function useFeedUpdates(feedType: 'social' | 'notifications') {
  const socket = getSocket();
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    if (!socket?.connected) return;

    const handleFeedUpdate = (data: any) => {
      setUpdates((prev) => [data, ...prev]);
    };

    const handlePostCreate = (data: any) => {
      if (feedType === 'social') {
        setUpdates((prev) => [{ type: 'post:create', ...data }, ...prev]);
      }
    };

    const handlePostReaction = (data: any) => {
      if (feedType === 'social') {
        setUpdates((prev) =>
          prev.map((u) =>
            u.postId === data.postId ? { ...u, reactions: data.reactions } : u
          )
        );
      }
    };

    socket.on(WSEventType.FEED_UPDATE, handleFeedUpdate);
    socket.on(WSEventType.POST_CREATE, handlePostCreate);
    socket.on(WSEventType.POST_REACTION, handlePostReaction);

    return () => {
      socket.off(WSEventType.FEED_UPDATE, handleFeedUpdate);
      socket.off(WSEventType.POST_CREATE, handlePostCreate);
      socket.off(WSEventType.POST_REACTION, handlePostReaction);
    };
  }, [socket, feedType]);

  return { updates };
}

/**
 * Hook for typing indicators in chat
 */
export function useTypingIndicator(channelId: string) {
  const socket = getSocket();
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!socket?.connected) return;

    const handleTyping = (data: any) => {
      if (data.channelId === channelId) {
        const typingUserId = String(data.userId ?? 'unknown');
        setIsTyping((prev) => ({
          ...prev,
          [typingUserId]: true,
        }));

        // Auto-clear typing indicator after 3 seconds
        setTimeout(() => {
          setIsTyping((prev) => ({
            ...prev,
            [typingUserId]: false,
          }));
        }, 3000);
      }
    };

    socket.on(WSEventType.TYPING_INDICATOR, handleTyping);

    return () => {
      socket.off(WSEventType.TYPING_INDICATOR, handleTyping);
    };
  }, [socket, channelId]);

  const emitTyping = useCallback(() => {
    if (!socket?.connected) return;

    socket.emit(WSEventType.TYPING_INDICATOR, {
      channelId,
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing after 2 seconds of no activity
    typingTimeoutRef.current = setTimeout(() => {
      const socketId = socket.id;
      if (!socketId) return;
      const typingUserId = String(socketId);
      setIsTyping((prev) => ({ ...prev, [typingUserId]: false }));
    }, 2000);
  }, [socket, channelId]);

  return {
    typingUsers: Object.entries(isTyping)
      .filter(([_, isTypingNow]) => isTypingNow)
      .map(([userId]) => userId),
    emitTyping,
  };
}
