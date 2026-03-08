import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { createPost, getPosts, getPostsByUser } from '@/lib/api-data';
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
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    const userId = Number.parseInt(session.user.id, 10);
    if (!Number.isInteger(userId) || userId <= 0) {
      return errorResponse('Invalid user session', 400);
    }

    const validation = await validateRequestBody(request, postCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const data = validation.data as {
      content: string;
      universe?: string;
      visibility?: 'public' | 'private' | 'friends';
      metadata?: Record<string, unknown>;
    };

    const post = await createPost({
      userId,
      universe: data.universe ?? 'social',
      content: data.content,
      visibility: data.visibility ?? 'public',
      metadata: data.metadata ?? {},
    });

    return successResponse({ post }, 201);
  } catch (error) {
    console.error('Error creating post:', error);
    return errorResponse('Internal server error', 500);
  }
}
