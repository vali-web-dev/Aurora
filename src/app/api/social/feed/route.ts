import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getFeedPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
} from '@/lib/api-data';
import { postCreateSchema, postUpdateSchema } from '@/lib/validations';
import {
  validateRequestBody,
  successResponse,
  errorResponse,
} from '@/lib/request-validation';
import {
  broadcastToUniverse,
  sendNotification,
} from '@/lib/websocket-server';
import { WSEventType } from '@/lib/websocket-types';

/**
 * GET /api/social/feed
 * Get personalized social feed with real-time updates
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse('Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    const universe = searchParams.get('universe') || 'social';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get feed posts (in production, this would be personalized based on follows, interests, etc.)
    const posts = await getFeedPosts(universe, limit, offset);

    return successResponse({
      posts,
      universe,
      pagination: {
        limit,
        offset,
        hasMore: posts.length === limit,
      },
      realTime: true,
      wsEvents: [
        WSEventType.POST_CREATE,
        WSEventType.POST_UPDATE,
        WSEventType.POST_DELETE,
        WSEventType.POST_REACTION,
        WSEventType.POST_COMMENT,
      ],
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * POST /api/social/feed
 * Create a new post and broadcast to real-time feed
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    const validation = await validateRequestBody(request, postCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const data = validation.data as any;

    // Create post in database
    const post = await createPost({
      userId: parseInt(session.user.id, 10),
      universe: data.universe || 'social',
      content: data.content,
      visibility: data.visibility || 'public',
      metadata: data.metadata || {},
    });

    // Broadcast to real-time feed subscribers
    broadcastToUniverse(post.universe, WSEventType.POST_CREATE, {
      id: post.id,
      authorUserId: post.authorUserId,
      universe: post.universe,
      content: post.content,
      visibility: post.visibility,
      metadata: post.metadata,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
    });

    console.log(
      `[Feed] Post created by user ${session.user.id} in ${post.universe} universe`
    );

    return successResponse(
      {
        post,
        broadcast: true,
        wsEvent: WSEventType.POST_CREATE,
      },
      201
    );
  } catch (error) {
    console.error('Error creating post:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * PUT /api/social/feed
 * Update a post and broadcast changes
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    const validation = await validateRequestBody(request, postUpdateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const data = validation.data as any;
    const postId = parseInt(data.postId, 10);

    // Get existing post
    const existingPost = await getPostById(postId);
    if (!existingPost) {
      return errorResponse('Post not found', 404);
    }

    // Verify ownership
    if (existingPost.authorUserId !== parseInt(session.user.id, 10)) {
      return errorResponse('Unauthorized to edit this post', 403);
    }

    // Update post
    const updatedPost = await updatePost(postId, {
      content: data.content,
      visibility: data.visibility,
      metadata: data.metadata,
    });

    // Broadcast update
    broadcastToUniverse(updatedPost.universe, WSEventType.POST_UPDATE, {
      id: updatedPost.id,
      userId: updatedPost.authorUserId,
      content: updatedPost.content,
      universe: updatedPost.universe,
      visibility: updatedPost.visibility,
      metadata: updatedPost.metadata,
      updatedAt: updatedPost.updatedAt,
    });

    console.log(`[Feed] Post ${postId} updated by user ${session.user.id}`);

    return successResponse({
      post: updatedPost,
      broadcast: true,
      wsEvent: WSEventType.POST_UPDATE,
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * DELETE /api/social/feed
 * Delete a post and broadcast removal
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    const postId = parseInt(searchParams.get('postId') || '0', 10);

    if (!postId) {
      return errorResponse('Post ID required', 400);
    }

    // Get existing post
    const existingPost = await getPostById(postId);
    if (!existingPost) {
      return errorResponse('Post not found', 404);
    }

    // Verify ownership
    if (existingPost.authorUserId !== parseInt(session.user.id, 10)) {
      return errorResponse('Unauthorized to delete this post', 403);
    }

    // Delete post
    await deletePost(postId);

    // Broadcast deletion
    broadcastToUniverse(existingPost.universe, WSEventType.POST_DELETE, {
      id: postId,
      userId: existingPost.authorUserId,
      universe: existingPost.universe,
      deletedAt: new Date().toISOString(),
    });

    console.log(`[Feed] Post ${postId} deleted by user ${session.user.id}`);

    return successResponse({
      success: true,
      postId,
      broadcast: true,
      wsEvent: WSEventType.POST_DELETE,
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return errorResponse('Internal server error', 500);
  }
}
