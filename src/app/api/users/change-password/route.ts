import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { changePasswordSchema } from '@/lib/validations';
import { validateRequestBody, successResponse, errorResponse } from '@/lib/request-validation';
import { z } from 'zod';

/**
 * POST /api/users/change-password
 * Change user password
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const validation = await validateRequestBody(request, changePasswordSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { currentPassword, newPassword } = validation.data as z.infer<typeof changePasswordSchema>;
    const userId = parseInt(session.user.id);

    // Get user with password hash
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Verify current password
    if (!user.passwordHash) {
      return errorResponse('This account uses OAuth login. Password cannot be changed.', 400);
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return errorResponse('Current password is incorrect', 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db
      .update(users)
      .set({ passwordHash: hashedPassword })
      .where(eq(users.id, userId));

    return successResponse({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return errorResponse('Internal server error', 500);
  }
}
