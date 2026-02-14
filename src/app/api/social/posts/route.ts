import { NextRequest, NextResponse } from 'next/server';
import { getPosts, getPost, getPostsByUser } from '@/lib/api-data';
import { postCreateSchema } from '@/lib/validations';
import { validateRequestBody, successResponse, errorResponse } from '@/lib/request-validation';

/**
 * GET /api/social/posts
 * Get all posts
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    let posts;
    if (userId) {
      posts = await getPostsByUser(parseInt(userId));
    } else {
      posts = await getPosts();
    }

    return successResponse(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * POST /api/social/posts
 * Create a new post
 */
export async function POST(request: NextRequest) {
  try {
    const validation = await validateRequestBody(request, postCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    // TODO: Implement create logic with auth check
    return errorResponse('Not implemented yet', 501);
  } catch (error) {
    console.error('Error creating post:', error);
    return errorResponse('Internal server error', 500);
  }
}
