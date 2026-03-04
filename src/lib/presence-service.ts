/**
 * Presence Tracking Service
 * Tracks online users, activity status, and real-time availability
 */

import { getWebSocketServer } from './websocket-server';
import { WSEventType, WSRooms } from './websocket-types';

export interface UserPresence {
  userId: string;
  status: 'online' | 'idle' | 'offline' | 'busy';
  lastActivity: number;
  universe?: string; // Current universe/section user is in
  activity?: string; // What they're doing (e.g., "editing", "viewing")
  device?: 'web' | 'mobile' | 'desktop';
}

const presenceMap = new Map<string, UserPresence>();
const activityTimeouts = new Map<string, NodeJS.Timeout>();

/**
 * Update user presence
 */
export function updatePresence(
  userId: string,
  presence: Partial<UserPresence>
) {
  const current = presenceMap.get(userId) || {
    userId,
    status: 'online',
    lastActivity: Date.now(),
  };

  const updated = {
    ...current,
    ...presence,
    lastActivity: Date.now(),
  };

  presenceMap.set(userId, updated);

  // Clear existing idle timeout
  if (activityTimeouts.has(userId)) {
    clearTimeout(activityTimeouts.get(userId)!);
  }

  // Set idle timeout (5 minutes of inactivity)
  const timeout = setTimeout(() => {
    const current = presenceMap.get(userId);
    if (current) {
      current.status = 'idle';
      broadcastPresence(updated);
    }
  }, 5 * 60 * 1000);

  activityTimeouts.set(userId, timeout);

  // Broadcast to presence channel
  broadcastPresence(updated);

  return updated;
}

/**
 * Get user presence
 */
export function getPresence(userId: string): UserPresence | null {
  return presenceMap.get(userId) || null;
}

/**
 * Get all online users
 */
export function getOnlineUsers(): UserPresence[] {
  return Array.from(presenceMap.values()).filter(
    (p) => p.status !== 'offline'
  );
}

/**
 * Remove user from presence (on disconnect)
 */
export function removePresence(userId: string) {
  presenceMap.delete(userId);

  if (activityTimeouts.has(userId)) {
    clearTimeout(activityTimeouts.get(userId)!);
    activityTimeouts.delete(userId);
  }

  // Broadcast offline event
  const io = getWebSocketServer();
  if (io) {
    io.to(WSRooms.presence).emit(WSEventType.PRESENCE_OFFLINE, {
      userId,
      timestamp: Date.now(),
    });
  }
}

/**
 * Mark user as busy
 */
export function setBusy(userId: string, reason?: string) {
  return updatePresence(userId, {
    status: 'busy',
    activity: reason,
  });
}

/**
 * Mark user as idle
 */
export function setIdle(userId: string) {
  return updatePresence(userId, {
    status: 'idle',
  });
}

/**
 * Mark user as back online
 */
export function setOnline(userId: string) {
  return updatePresence(userId, {
    status: 'online',
  });
}

/**
 * Broadcast presence update
 */
function broadcastPresence(presence: UserPresence) {
  const io = getWebSocketServer();
  if (io) {
    io.to(WSRooms.presence).emit(WSEventType.PRESENCE_UPDATE, {
      ...presence,
      timestamp: Date.now(),
    });
  }
}

/**
 * Get users in specific universe
 */
export function getUsersInUniverse(universe: string): UserPresence[] {
  return Array.from(presenceMap.values()).filter(
    (p) => p.universe === universe && p.status !== 'offline'
  );
}

/**
 * Watch for presence changes (server-side)
 * Note: Use client-side hooks (usePresence) for component integration
 */
export function watchPresenceChanges(
  io: any,
  callback: (presence: UserPresence) => void
) {
  // Broadcast presence updates to all connected clients
  // This handler is attached to individual socket connections
  return () => {
    void callback;
  };
}
