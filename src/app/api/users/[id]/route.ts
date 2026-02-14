import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { users, sessions, accounts } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@/lib/auth';

/**
 * DELETE /api/users/[id]
 * Delete a user account (admin or self)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(params.id);
    const currentUserId = parseInt(session.user.id);

    // Users can only delete their own account
    if (userId !== currentUserId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete user's sessions
    await db.delete(sessions).where(eq(sessions.userId, userId));

    // Delete user's OAuth accounts
    await db.delete(accounts).where(eq(accounts.userId, userId));

    // Delete user
    await db.delete(users).where(eq(users.id, userId));

    // Sign out the user
    // Note: This is a bit tricky in API routes, so we leave it to client
    return NextResponse.json({
      message: 'Account deleted successfully',
      signOutRequired: true,
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/users/[id]
 * Get user by ID (public profile)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
