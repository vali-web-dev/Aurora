import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { userProfileUpdateSchema } from '@/lib/validations';
import { validateRequestBody, successResponse, errorResponse } from '@/lib/request-validation';
import { z } from 'zod';

/**
 * GET /api/users/profile
 * Get current user profile
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(session.user.id)))
      .limit(1);

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      displayName: user.displayName,
      image: user.image,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * PUT /api/users/profile
 * Update current user profile
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const validation = await validateRequestBody(request, userProfileUpdateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { name, displayName } = validation.data as z.infer<typeof userProfileUpdateSchema>;
    const userId = parseInt(session.user.id);

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (displayName !== undefined) updateData.displayName = displayName;

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId));

    const [updatedUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return successResponse({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      displayName: updatedUser.displayName,
      image: updatedUser.image,
      avatarUrl: updatedUser.avatarUrl,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return errorResponse('Internal server error', 500);
  }
}
