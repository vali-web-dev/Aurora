import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import * as schema from '@/lib/schema';
import { getCourses } from '@/lib/api-data';
import { courseCreateSchema } from '@/lib/validations';
import { validateRequestBody, successResponse, errorResponse } from '@/lib/request-validation';

function getAdminAllowlist(): string[] {
  const multi = (process.env.AURORA_ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const single = [process.env.AURORA_ADMIN_EMAIL, process.env.ADMIN_EMAIL]
    .map((value) => (value || '').trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set([...multi, ...single]));
}

/**
 * GET /api/learning/courses
 * Get all learning courses
 */
export async function GET(request: NextRequest) {
  try {
    const courses = await getCourses();
    return successResponse(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * POST /api/learning/courses
 * Create a new course (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = Number.parseInt(session?.user?.id || '', 10);
    const email = session?.user?.email?.trim().toLowerCase() || '';
    const allowlist = getAdminAllowlist();

    if (!session?.user?.id || !email) {
      return errorResponse('Authentication required', 401);
    }
    if (!Number.isInteger(userId) || userId <= 0) {
      return errorResponse('Invalid user session', 400);
    }
    if (!allowlist.includes(email)) {
      return errorResponse('Forbidden: admin access required', 403);
    }

    const validation = await validateRequestBody(request, courseCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const data = validation.data as {
      title: string;
      description: string;
      category?: string;
      level: 'beginner' | 'intermediate' | 'advanced';
    };

    const [course] = await db
      .insert(schema.learningCourses)
      .values({
        source: 'aurora',
        externalId: `aurora-${Date.now()}`,
        title: data.title,
        description: data.description,
        level: data.level,
        metadata: {
          category: data.category ?? null,
          createdBy: userId,
        },
      })
      .returning();

    return successResponse({ course }, 201);
  } catch (error) {
    console.error('Error creating course:', error);
    return errorResponse('Internal server error', 500);
  }
}
