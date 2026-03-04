import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import * as schema from '@/lib/schema';
import { and, eq } from 'drizzle-orm';

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read for the current user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number.parseInt(session.user.id, 10);
    const updated = await db
      .update(schema.notifications)
      .set({ read: true })
      .where(and(eq(schema.notifications.userId, userId), eq(schema.notifications.read, false)))
      .returning({ id: schema.notifications.id });

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read',
      count: updated.length,
    });
  } catch (error) {
    console.error('[Notifications API] mark-all-read error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
