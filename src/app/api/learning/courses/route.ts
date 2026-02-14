import { NextRequest, NextResponse } from 'next/server';
import { getCourses } from '@/lib/api-data';
import { courseCreateSchema } from '@/lib/validations';
import { validateRequestBody, successResponse, errorResponse } from '@/lib/request-validation';

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
    const validation = await validateRequestBody(request, courseCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    // TODO: Implement create logic with admin check
    return errorResponse('Not implemented yet', 501);
  } catch (error) {
    console.error('Error creating course:', error);
    return errorResponse('Internal server error', 500);
  }
}
