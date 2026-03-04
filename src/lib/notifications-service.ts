/**
 * Real-Time Notification Service
 * Manages WebSocket-based notifications with database persistence
 */

import { db } from './db';
import { getWebSocketServer } from './websocket-server';
import { WSEventType, WSRooms } from './websocket-types';
import * as schema from './schema';
import { eq, and } from 'drizzle-orm';

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
  const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const notification: Notification = {
    id,
    userId,
    type,
    title,
    message,
    link: options?.link,
    read: false,
    createdAt: new Date(),
    data: options?.data,
  };

  // Persist in database (table needs to be created)
  try {
    // TODO: Insert into notifications table when schema is updated
    // await db.insert(schema.notifications).values(notification);
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
  // TODO: Update in database when notifications table is added
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
  // TODO: Delete from database
  const io = getWebSocketServer();
  if (io) {
    io.to(WSRooms.notifications(String(userId))).emit('notifications:cleared');
  }
}
