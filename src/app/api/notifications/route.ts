import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import * as schema from '@/lib/schema';
import { eq, desc, and } from 'drizzle-orm';

/**
 * GET /api/notifications
 * Get user's notifications
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const notifications = await db
      .select()
      .from(schema.notifications)
      .where(
        unreadOnly
          ? and(eq(schema.notifications.userId, userId), eq(schema.notifications.read, false))
          : eq(schema.notifications.userId, userId)
      )
      .orderBy(desc(schema.notifications.createdAt))
      .limit(limit);

    const unreadNotifications = await db
      .select({ id: schema.notifications.id })
      .from(schema.notifications)
      .where(and(eq(schema.notifications.userId, userId), eq(schema.notifications.read, false)));

    const normalized = notifications.map((notification) => ({
      id: notification.id,
      userId: notification.userId,
      type: (notification.kind || 'system') as
        | 'mention'
        | 'reaction'
        | 'comment'
        | 'message'
        | 'system'
        | 'follow',
      title: notification.title || 'Notification',
      message: notification.body || '',
      link: notification.payload && typeof notification.payload === 'object'
        ? (notification.payload as Record<string, unknown>).link as string | undefined
        : undefined,
      read: notification.read ?? false,
      createdAt: notification.createdAt,
      data: notification.payload,
    }));

    return NextResponse.json({
      notifications: normalized,
      unreadCount: unreadNotifications.length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications/mark-read
 * Mark notification as read
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID required' },
        { status: 400 }
      );
    }

    await db
      .update(schema.notifications)
      .set({ read: true })
      .where(and(eq(schema.notifications.id, Number(notificationId)), eq(schema.notifications.userId, parseInt(session.user.id, 10))));

    return NextResponse.json({
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications
 * Clear all notifications for current user
 */
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db
      .delete(schema.notifications)
      .where(eq(schema.notifications.userId, parseInt(session.user.id, 10)));

    return NextResponse.json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return NextResponse.json(
      { error: 'Failed to clear notifications' },
      { status: 500 }
    );
  }
}
