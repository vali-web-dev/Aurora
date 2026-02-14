import { NextRequest, NextResponse } from 'next/server';
import { getCourse, getLessons } from '@/lib/api-data';

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
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const course = await getCourse(courseId);

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const lessons = await getLessons(courseId);

    return NextResponse.json({
      ...course,
      lessons,
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
