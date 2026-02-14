import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { users, sessions, accounts } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/request-validation';

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
      return errorResponse('Unauthorized', 401);
    }

    const userId = parseInt(params.id);
    const currentUserId = parseInt(session.user.id);

    // Users can only delete their own account
    if (userId !== currentUserId) {
      return errorResponse('Forbidden', 403);
    }

    // Delete user's sessions
    await db.delete(sessions).where(eq(sessions.userId, userId));

    // Delete user's OAuth accounts
    await db.delete(accounts).where(eq(accounts.userId, userId));

    // Delete user
    await db.delete(users).where(eq(users.id, userId));

    return successResponse({
      message: 'Account deleted successfully',
      signOutRequired: true,
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return errorResponse('Internal server error', 500);
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
      return errorResponse('User not found', 404);
    }

    return successResponse(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return errorResponse('Internal server error', 500);
  }
}
