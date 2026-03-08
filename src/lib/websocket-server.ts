/**
 * WebSocket Server Manager
 * Handles real-time connections, events, and message routing
 */

import { Server, Socket } from 'socket.io';
import {
  WSMessage,
  WSConnectionContext,
  WSEventType,
  WSErrorCode,
  WSRooms,
} from './websocket-types';

declare global {
  // eslint-disable-next-line no-var
  var __auroraWebSocketServer__: Server | undefined;
}

// ============================================================================
// SINGLETON WEBSOCKET SERVER INSTANCE
// ============================================================================

let ioInstance: Server | null = globalThis.__auroraWebSocketServer__ ?? null;
const connections = new Map<string, WSConnectionContext>();
const userSockets = new Map<string, string[]>(); // userId -> socketIds

/**
 * Initialize WebSocket server
 */
export function initializeWebSocket(server: any): Server {
  if (ioInstance) return ioInstance;

  ioInstance = new Server(server, {
    path: '/socket.io',
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 60000,
  });
  globalThis.__auroraWebSocketServer__ = ioInstance;

  // Connection handler
  ioInstance.on('connection', (socket: Socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    // Authentication
    socket.on(WSEventType.AUTHENTICATE, (data: any) =>
      handleAuthentication(socket, data)
    );

    // Social universe events
    socket.on(WSEventType.POST_CREATE, (data) =>
      handlePostCreate(socket, data)
    );
    socket.on(WSEventType.POST_REACTION, (data) =>
      handlePostReaction(socket, data)
    );
    socket.on(WSEventType.FEED_UPDATE, (data) =>
      handleFeedUpdate(socket, data)
    );

    // Community events
    socket.on(WSEventType.MESSAGE, (data) => handleMessage(socket, data));
    socket.on(WSEventType.TYPING_INDICATOR, (data) =>
      handleTypingIndicator(socket, data)
    );

    // Presence events
    socket.on(WSEventType.PRESENCE_UPDATE, (data) =>
      handlePresenceUpdate(socket, data)
    );

    // Sync events
    socket.on(WSEventType.SYNC_REQUEST, (data) =>
      handleSyncRequest(socket, data)
    );

    // Room controls
    socket.on('join', (data) => handleJoinRoom(socket, data));
    socket.on('leave', (data) => handleLeaveRoom(socket, data));

    // Disconnect
    socket.on('disconnect', () => handleDisconnect(socket));
    socket.on('error', (error) => handleError(socket, error));
  });

  return ioInstance;
}

/**
 * Get WebSocket server instance
 */
export function getWebSocketServer(): Server | null {
  if (ioInstance) return ioInstance;
  return globalThis.__auroraWebSocketServer__ ?? null;
}

// ============================================================================
// CONNECTION MANAGEMENT
// ============================================================================

async function handleAuthentication(socket: Socket, data: any) {
  try {
    const { sessionId, token } = data;

    if (!sessionId || !token) {
      socket.emit(WSEventType.ERROR, {
        code: WSErrorCode.AUTHENTICATION_FAILED,
        message: 'Missing authentication credentials',
      });
      socket.disconnect();
      return;
    }

    // In production, verify token with your auth system
    // For now, we'll just validate the session exists
    const user = {
      id: data.userId || 'user-' + Math.random().toString(36).substr(2, 9),
      email: data.email || 'user@aurora.app',
      sessionId,
    };

    const context: WSConnectionContext = {
      userId: user.id,
      sessionId,
      email: user.email,
      socketId: socket.id,
      connectedAt: Date.now(),
      rooms: [],
    };

    // Store connection
    connections.set(socket.id, context);
    if (!userSockets.has(user.id)) {
      userSockets.set(user.id, []);
    }
    userSockets.get(user.id)!.push(socket.id);

    // Join user-specific room
    socket.join(WSRooms.user(user.id));
    socket.join(WSRooms.notifications(user.id));
    socket.join(WSRooms.presence);

    console.log(
      `[WebSocket] User authenticated: ${user.id} (socket: ${socket.id})`
    );

    // Notify others of presence
    socket.broadcast.to(WSRooms.presence).emit(WSEventType.PRESENCE_ONLINE, {
      userId: user.id,
      timestamp: Date.now(),
    });

    socket.emit(WSEventType.AUTHENTICATE, {
      success: true,
      userId: user.id,
      socketId: socket.id,
    });
  } catch (error) {
    console.error('[WebSocket] Authentication error:', error);
    socket.emit(WSEventType.ERROR, {
      code: WSErrorCode.AUTHENTICATION_FAILED,
      message: 'Authentication failed',
    });
    socket.disconnect();
  }
}

function handleDisconnect(socket: Socket) {
  const context = connections.get(socket.id);
  if (context) {
    // Remove connection
    connections.delete(socket.id);

    // Remove from user sockets
    const userSocketList = userSockets.get(context.userId);
    if (userSocketList) {
      const index = userSocketList.indexOf(socket.id);
      if (index > -1) {
        userSocketList.splice(index, 1);
      }
      if (userSocketList.length === 0) {
        userSockets.delete(context.userId);

        // Notify presence offline only if last socket
        if (ioInstance) {
          ioInstance.to(WSRooms.presence).emit(WSEventType.PRESENCE_OFFLINE, {
            userId: context.userId,
            timestamp: Date.now(),
          });
        }
      }
    }

    console.log(`[WebSocket] User disconnected: ${context.userId}`);
  }

  socket.removeAllListeners();
}

function handleError(socket: Socket, error: any) {
  console.error('[WebSocket] Socket error:', error);
  socket.emit(WSEventType.ERROR, {
    code: WSErrorCode.SERVER_ERROR,
    message: 'Server error occurred',
  });
}

function handleJoinRoom(socket: Socket, data: any) {
  const room = typeof data?.room === 'string' ? data.room.trim() : '';
  if (!room) return;

  socket.join(room);
}

function handleLeaveRoom(socket: Socket, data: any) {
  const room = typeof data?.room === 'string' ? data.room.trim() : '';
  if (!room) return;

  socket.leave(room);
}

// ============================================================================
// SOCIAL UNIVERSE EVENTS
// ============================================================================

function handlePostCreate(socket: Socket, data: any) {
  const context = connections.get(socket.id);
  if (!context) return;

  try {
    const message: WSMessage = {
      type: WSEventType.POST_CREATE,
      payload: {
        ...data,
        userId: context.userId,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
      userId: context.userId,
    };

    // Broadcast to universe
    if (ioInstance && data.universe) {
      ioInstance
        .to(WSRooms.universe(data.universe))
        .emit(WSEventType.POST_CREATE, message.payload);
    }

    console.log(
      `[WebSocket] Post created by ${context.userId}: ${data.universe}`
    );
  } catch (error) {
    console.error('[WebSocket] Error handling post creation:', error);
  }
}

function handlePostReaction(socket: Socket, data: any) {
  const context = connections.get(socket.id);
  if (!context) return;

  try {
    // Broadcast reaction to all subscribers
    if (ioInstance && data.postId) {
      ioInstance.emit(WSEventType.POST_REACTION, {
        ...data,
        userId: context.userId,
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    console.error('[WebSocket] Error handling post reaction:', error);
  }
}

function handleFeedUpdate(socket: Socket, data: any) {
  const context = connections.get(socket.id);
  if (!context) return;

  try {
    // Subscribe to universe feed
    const universe = data.universe || 'social';
    const room = WSRooms.universe(universe);
    socket.join(room);
    context.rooms = Array.from(new Set([...(context.rooms || []), room]));

    console.log(
      `[WebSocket] ${context.userId} subscribed to ${universe} universe`
    );
  } catch (error) {
    console.error('[WebSocket] Error handling feed update:', error);
  }
}

// ============================================================================
// COMMUNITIES UNIVERSE EVENTS
// ============================================================================

function handleMessage(socket: Socket, data: any) {
  const context = connections.get(socket.id);
  if (!context) return;

  try {
    const message: WSMessage = {
      type: WSEventType.MESSAGE,
      payload: {
        ...data,
        userId: context.userId,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
      userId: context.userId,
    };

    if (ioInstance && data.communityId) {
      socket.join(WSRooms.community(data.communityId));

      // Broadcast to community room
      ioInstance
        .to(WSRooms.community(data.communityId))
        .emit(WSEventType.MESSAGE, message.payload);
    }

    console.log(
      `[WebSocket] Message in community ${data.communityId} from ${context.userId}`
    );
  } catch (error) {
    console.error('[WebSocket] Error handling message:', error);
  }
}

function handleTypingIndicator(socket: Socket, data: any) {
  const context = connections.get(socket.id);
  if (!context) return;

  try {
    if (!ioInstance) return;

    if (data.communityId) {
      socket.join(WSRooms.community(data.communityId));
      ioInstance.to(WSRooms.community(data.communityId)).emit(
        WSEventType.TYPING_INDICATOR,
        {
          userId: context.userId,
          userName: data.userName,
          communityId: data.communityId,
          isTyping: data.isTyping,
          timestamp: Date.now(),
        }
      );
      return;
    }

    if (data.postId) {
      ioInstance.to(WSRooms.universe('social')).emit(
        WSEventType.TYPING_INDICATOR,
        {
          userId: context.userId,
          userName: data.userName,
          postId: data.postId,
          isTyping: data.isTyping,
          timestamp: Date.now(),
        }
      );
    }
  } catch (error) {
    console.error('[WebSocket] Error handling typing indicator:', error);
  }
}

// ============================================================================
// PRESENCE & SYNC EVENTS
// ============================================================================

function handlePresenceUpdate(socket: Socket, data: any) {
  const context = connections.get(socket.id);
  if (!context) return;

  try {
    if (ioInstance) {
      ioInstance.to(WSRooms.presence).emit(WSEventType.PRESENCE_UPDATE, {
        userId: context.userId,
        status: data.status || 'online',
        universe: data.universe,
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    console.error('[WebSocket] Error handling presence update:', error);
  }
}

function handleSyncRequest(socket: Socket, data: any) {
  const context = connections.get(socket.id);
  if (!context) return;

  try {
    // In production, fetch from database based on entityType and lastSyncTime
    socket.emit(WSEventType.SYNC_RESPONSE, {
      entityType: data.entityType,
      data: [],
      syncTime: Date.now(),
    });
  } catch (error) {
    console.error('[WebSocket] Error handling sync request:', error);
  }
}

// ============================================================================
// BROADCAST UTILITIES
// ============================================================================

/**
 * Broadcast event to specific user
 */
export function broadcastToUser(
  userId: string,
  event: WSEventType,
  payload: any
) {
  if (!ioInstance) return;

  ioInstance.to(WSRooms.user(userId)).emit(event, {
    ...payload,
    timestamp: Date.now(),
  });
}

/**
 * Broadcast event to community
 */
export function broadcastToCommunity(
  communityId: string,
  event: WSEventType,
  payload: any
) {
  if (!ioInstance) return;

  ioInstance.to(WSRooms.community(communityId)).emit(event, {
    ...payload,
    timestamp: Date.now(),
  });
}

/**
 * Broadcast event to universe
 */
export function broadcastToUniverse(
  universe: string,
  event: WSEventType,
  payload: any
) {
  if (!ioInstance) return;

  ioInstance.to(WSRooms.universe(universe)).emit(event, {
    ...payload,
    timestamp: Date.now(),
  });
}

/**
 * Broadcast notification to user
 */
export function sendNotification(userId: string, notification: any) {
  broadcastToUser(userId, WSEventType.NOTIFICATION, notification);
}

/**
 * Get active connection info
 */
export function getConnectionInfo(socketId: string): WSConnectionContext | null {
  return connections.get(socketId) || null;
}

/**
 * Get all active connections
 */
export function getAllConnections(): Map<string, WSConnectionContext> {
  return connections;
}

/**
 * Get user's socket IDs
 */
export function getUserSockets(userId: string): string[] {
  return userSockets.get(userId) || [];
}
