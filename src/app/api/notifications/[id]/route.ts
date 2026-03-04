import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import * as schema from '@/lib/schema';
import { and, eq } from 'drizzle-orm';

/**
 * PATCH /api/notifications/[id]
 * Update notification (mark as read/unread)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = Number.parseInt(params.id, 10);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 });
    }

    const body = await request.json();
    const read = Boolean(body?.read);

    const userId = Number.parseInt(session.user.id, 10);
    const updated = await db
      .update(schema.notifications)
      .set({ read })
      .where(and(eq(schema.notifications.id, id), eq(schema.notifications.userId, userId)))
      .returning({
        id: schema.notifications.id,
        read: schema.notifications.read,
      });

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Notification updated',
      notification: updated[0],
    });
  } catch (error) {
    console.error('[Notifications API] PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/notifications/[id]
 * Delete a specific notification
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = Number.parseInt(params.id, 10);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 });
    }

    const userId = Number.parseInt(session.user.id, 10);
    const deleted = await db
      .delete(schema.notifications)
      .where(and(eq(schema.notifications.id, id), eq(schema.notifications.userId, userId)))
      .returning({ id: schema.notifications.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error('[Notifications API] DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
