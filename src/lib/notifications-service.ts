/**
 * Real-Time Notification Service
 * Manages WebSocket-based notifications with database persistence
 */

import { db } from './db';
import { getWebSocketServer } from './websocket-server';
import { WSEventType, WSRooms } from './websocket-types';
import * as schema from './schema';
import { and, eq } from 'drizzle-orm';

export interface Notification {
  id: string;
  userId: number;
  type: 'mention' | 'reaction' | 'comment' | 'message' | 'system' | 'follow';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  data?: Record<string, any>;
}

/**
 * Create and broadcast a notification
 */
export async function createNotification(
  userId: number,
  type: Notification['type'],
  title: string,
  message: string,
  options?: {
    link?: string;
    data?: Record<string, any>;
  }
): Promise<Notification> {
  const notification: Notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    userId,
    type,
    title,
    message,
    link: options?.link,
    read: false,
    createdAt: new Date(),
    data: options?.data,
  };

  try {
    const inserted = await db
      .insert(schema.notifications)
      .values({
        userId,
        kind: type,
        title,
        body: message,
        payload: {
          ...(options?.data || {}),
          ...(options?.link ? { link: options.link } : {}),
        },
        read: false,
      })
      .returning({
        id: schema.notifications.id,
        createdAt: schema.notifications.createdAt,
      });

    if (inserted[0]) {
      notification.id = String(inserted[0].id);
      notification.createdAt = inserted[0].createdAt || notification.createdAt;
    }
  } catch (err) {
    console.error('[Notifications] Failed to persist:', err);
  }

  // Broadcast via WebSocket
  const io = getWebSocketServer();
  if (io) {
    io.to(WSRooms.notifications(String(userId))).emit(WSEventType.NOTIFICATION, {
      ...notification,
      timestamp: Date.now(),
    });
  }

  return notification;
}

/**
 * Create mention notification
 */
export async function notifyMention(
  userId: number,
  mentionedByName: string,
  postId: string,
  postExcerpt: string
) {
  return createNotification(
    userId,
    'mention',
    `${mentionedByName} mentioned you`,
    postExcerpt,
    { link: `/social/post/${postId}` }
  );
}

/**
 * Create reaction notification
 */
export async function notifyReaction(
  userId: number,
  reactedByName: string,
  reactionType: string,
  postId: string
) {
  return createNotification(
    userId,
    'reaction',
    `${reactedByName} reacted with ${reactionType}`,
    `to your post`,
    { link: `/social/post/${postId}` }
  );
}

/**
 * Create comment notification
 */
export async function notifyComment(
  userId: number,
  commentedByName: string,
  postId: string,
  commentExcerpt: string
) {
  return createNotification(
    userId,
    'comment',
    `${commentedByName} commented`,
    commentExcerpt,
    { link: `/social/post/${postId}` }
  );
}

/**
 * Create message notification
 */
export async function notifyMessage(
  userId: number,
  senderName: string,
  conversationId: string,
  messagePreview: string
) {
  return createNotification(
    userId,
    'message',
    `New message from ${senderName}`,
    messagePreview,
    { link: `/communities/${conversationId}` }
  );
}

/**
 * Create system notification
 */
export async function notifySystem(
  userId: number,
  title: string,
  message: string,
  link?: string
) {
  return createNotification(userId, 'system', title, message, { link });
}

/**
 * Broadcast notification to multiple users
 */
export async function broadcastNotification(
  userIds: number[],
  type: Notification['type'],
  title: string,
  message: string
) {
  const io = getWebSocketServer();
  if (!io) return;

  for (const userId of userIds) {
    await createNotification(userId, type, title, message);
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  userId: number,
  notificationId: string
) {
  const numericId = Number.parseInt(notificationId, 10);
  if (Number.isFinite(numericId)) {
    try {
      await db
        .update(schema.notifications)
        .set({ read: true })
        .where(and(eq(schema.notifications.id, numericId), eq(schema.notifications.userId, userId)));
    } catch (err) {
      console.error('[Notifications] Failed to mark as read:', err);
    }
  }

  const io = getWebSocketServer();
  if (io) {
    io.to(WSRooms.notifications(String(userId))).emit('notification:read', {
      notificationId,
    });
  }
}

/**
 * Clear all notifications for user
 */
export async function clearNotifications(userId: number) {
  try {
    await db.delete(schema.notifications).where(eq(schema.notifications.userId, userId));
  } catch (err) {
    console.error('[Notifications] Failed to clear:', err);
  }

  const io = getWebSocketServer();
  if (io) {
    io.to(WSRooms.notifications(String(userId))).emit('notifications:cleared');
  }
}
