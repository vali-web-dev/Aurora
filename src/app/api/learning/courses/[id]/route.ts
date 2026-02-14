import { NextRequest, NextResponse } from 'next/server';
import { getCourse, getLessons } from '@/lib/api-data';
import { successResponse, errorResponse } from '@/lib/request-validation';

/**
 * GET /api/learning/courses/[id]
 * Get course details with lessons
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id);

    if (isNaN(courseId)) {
      return errorResponse('Invalid course ID', 400);
    }

    const course = await getCourse(courseId);

    if (!course) {
      return errorResponse('Course not found', 404);
    }

    const lessons = await getLessons(courseId);

    return successResponse({
      ...course,
      lessons,
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return errorResponse('Internal server error', 500);
  }
}
