import { NextRequest, NextResponse } from 'next/server';
import { getCourses, getCourse, getLessons } from '@/lib/api-data';

/**
 * GET /api/learning/courses
 * Get all learning courses
 */
export async function GET(request: NextRequest) {
  try {
    const courses = await getCourses();
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/learning/courses
 * Create a new course (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // TODO: Implement create logic with admin check
    return NextResponse.json(
      { error: 'Not implemented yet' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
