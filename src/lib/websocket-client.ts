/**
 * Socket.IO Client Utility
 * Provides a singleton instance for WebSocket connections from the client
 */

'use client';

import { io, Socket } from 'socket.io-client';
import { WSEventType } from './websocket-types';

let socket: Socket | null = null;
const socketListeners = new Set<(nextSocket: Socket | null) => void>();

function notifySocketListeners() {
  for (const listener of socketListeners) {
    listener(socket);
  }
}

function bindLegacySocketReference(nextSocket: Socket | null) {
  if (typeof window === 'undefined') return;
  (window as unknown as { __socket?: Socket | null }).__socket = nextSocket;
}

/**
 * Initialize Socket.IO client connection
 */
export function initializeSocket(
  url?: string
): Socket {
  if (socket?.connected) {
    return socket;
  }

  if (socket && !socket.connected) {
    socket.connect();
    return socket;
  }

  // Auto-detect URL from browser window if not provided
  const socketUrl = url || 
    (typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.host}`
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

  console.log('[Socket.IO] Connecting to', socketUrl);

  const socketPath = process.env.NEXT_PUBLIC_SOCKET_PATH || '/socket.io';

  socket = io(socketUrl, {
    path: socketPath,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10,
    transports: ['websocket', 'polling'],
  });

  bindLegacySocketReference(socket);
  notifySocketListeners();

  // Connection events
  socket.on('connect', () => {
    console.log('[Socket.IO] Connected:', socket!.id);
    notifySocketListeners();
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.IO] Disconnected:', reason);
    notifySocketListeners();
  });

  socket.on('error', (error) => {
    console.error('[Socket.IO] Error:', error);
  });

  return socket;
}

/**
 * Get Socket.IO instance
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Subscribe to socket lifecycle changes
 */
export function subscribeToSocketChanges(listener: (nextSocket: Socket | null) => void): () => void {
  socketListeners.add(listener);
  listener(socket);

  return () => {
    socketListeners.delete(listener);
  };
}

/**
 * Authenticate WebSocket connection
 */
export async function authenticateSocket(
  sessionId: string,
  userId: string,
  token: string
): Promise<boolean> {
  if (!socket) {
    console.error('[Socket.IO] Socket not initialized');
    return false;
  }

  return new Promise((resolve) => {
    let settled = false;
    const finalize = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      socket!.off(WSEventType.AUTHENTICATE, handleAuthResponse);
      socket!.off(WSEventType.ERROR, handleAuthError);
      resolve(ok);
    };

    const handleAuthResponse = (response: any) => {
      if (response?.success) {
        console.log('[Socket.IO] Authenticated as', response.userId);
        finalize(true);
      } else {
        console.error('[Socket.IO] Authentication failed');
        finalize(false);
      }
    };

    const handleAuthError = () => {
      finalize(false);
    };

    socket!.emit(WSEventType.AUTHENTICATE, {
      sessionId,
      userId,
      token,
    });

    socket!.once(WSEventType.AUTHENTICATE, handleAuthResponse);
    socket!.once(WSEventType.ERROR, handleAuthError);

    // Timeout after 5 seconds
    const timeoutId = setTimeout(() => {
      finalize(false);
    }, 5000);
  });
}

/**
 * Emit WebSocket event
 */
export function emitEvent(
  eventType: WSEventType,
  payload: any,
  callback?: (response: any) => void
): void {
  const activeSocket = socket ?? initializeSocket();
  activeSocket.emit(eventType, payload, callback);
}

/**
 * Listen to WebSocket event
 */
export function onEvent(
  eventType: WSEventType,
  listener: (payload: any) => void
): () => void {
  const activeSocket = socket ?? initializeSocket();
  activeSocket.on(eventType, listener);

  // Return unsubscribe function
  return () => {
    activeSocket.off(eventType, listener);
  };
}

/**
 * Listen to event once
 */
export function onceEvent(
  eventType: WSEventType,
  listener: (payload: any) => void
): void {
  const activeSocket = socket ?? initializeSocket();
  activeSocket.once(eventType, listener);
}

/**
 * Join room
 */
export function joinRoom(room: string): void {
  const activeSocket = socket ?? initializeSocket();
  activeSocket.emit('join', { room });
}

/**
 * Leave room
 */
export function leaveRoom(room: string): void {
  const activeSocket = socket ?? initializeSocket();
  activeSocket.emit('leave', { room });
}

/**
 * Disconnect Socket.IO
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    bindLegacySocketReference(null);
    notifySocketListeners();
  }
}

/**
 * Check if connected
 */
export function isConnected(): boolean {
  return socket?.connected ?? false;
}

/**
 * Get socket ID
 */
export function getSocketId(): string | null {
  return socket?.id ?? null;
}

// ============================================================================
// SOCIAL UNIVERSE HELPERS
// ============================================================================

/**
 * Create post
 */
export function createPost(
  content: string,
  universe: string,
  metadata?: Record<string, any>
): void {
  emitEvent(WSEventType.POST_CREATE, {
    content,
    universe,
    metadata,
  });
}

/**
 * React to post
 */
export function reactToPost(postId: string, emoji: string): void {
  emitEvent(WSEventType.POST_REACTION, {
    postId,
    emoji,
    action: 'add',
  });
}

/**
 * Subscribe to universe feed
 */
export function subscribeFeed(universe: string): void {
  emitEvent(WSEventType.FEED_UPDATE, {
    universe,
  });
}

// ============================================================================
// COMMUNITIES UNIVERSE HELPERS
// ============================================================================

/**
 * Send message
 */
export function sendMessage(communityId: string, content: string): void {
  emitEvent(WSEventType.MESSAGE, {
    communityId,
    content,
  });
}

/**
 * Send typing indicator
 */
export function sendTypingIndicator(communityId: string, isTyping: boolean): void {
  emitEvent(WSEventType.TYPING_INDICATOR, {
    communityId,
    isTyping,
  });
}

// ============================================================================
// PRESENCE HELPERS
// ============================================================================

/**
 * Update presence
 */
export function updatePresence(
  status: 'online' | 'offline' | 'idle',
  universe?: string
): void {
  emitEvent(WSEventType.PRESENCE_UPDATE, {
    status,
    universe,
  });
}

/**
 * Listen to notifications
 */
export function onNotification(
  listener: (notification: any) => void
): () => void {
  return onEvent(WSEventType.NOTIFICATION, listener);
}

/**
 * Listen to presence updates
 */
export function onPresenceUpdate(listener: (data: any) => void): () => void {
  return onEvent(WSEventType.PRESENCE_UPDATE, listener);
}

/**
 * Listen to messages
 */
export function onMessage(listener: (message: any) => void): () => void {
  return onEvent(WSEventType.MESSAGE, listener);
}

/**
 * Listen to typing indicators
 */
export function onTypingIndicator(
  listener: (data: any) => void
): () => void {
  return onEvent(WSEventType.TYPING_INDICATOR, listener);
}
