import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getPostComments,
  createComment,
  deleteComment,
} from '@/lib/api-data';
import { db } from '@/lib/db';
import * as schema from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { commentCreateSchema } from '@/lib/validations';
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
import type { z } from 'zod';

type CommentCreatePayload = z.infer<typeof commentCreateSchema>;

/**
 * GET /api/social/comments
 * Get comments for a post
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = parseInt(searchParams.get('postId') || '0', 10);

    if (!postId) {
      return errorResponse('Post ID required', 400);
    }

    const comments = await getPostComments(postId);

    return successResponse({
      postId,
      comments,
      count: comments.length,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * POST /api/social/comments
 * Add comment to post with real-time broadcast
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    const userId = parseInt(session.user.id, 10);

    const validation = await validateRequestBody(request, commentCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const data = validation.data as CommentCreatePayload;
    const postId = data.postId;
    const parentCommentId = data.parentCommentId;

    const [post] = await db
      .select({ id: schema.socialPosts.id, authorUserId: schema.socialPosts.authorUserId })
      .from(schema.socialPosts)
      .where(eq(schema.socialPosts.id, postId))
      .limit(1);

    if (!post) {
      return errorResponse('Post not found', 404);
    }

    // Create comment
    const comment = await createComment({
      postId,
      userId,
      content: data.content,
      parentCommentId,
    });

    const authorName = session.user.name || session.user.email || 'Unknown User';
    const commentWithAuthor = {
      ...comment,
      author: {
        id: session.user.id,
        name: authorName,
      },
    };

    // Broadcast comment to all feed subscribers
    broadcastToUniverse('social', WSEventType.POST_COMMENT, {
      id: comment.id,
      postId,
      userId,
      content: data.content,
      parentCommentId: comment.parentCommentId ?? null,
      createdAt: comment.createdAt,
      author: {
        id: session.user.id,
        name: authorName,
      },
    });

    if (post.authorUserId !== userId) {
      sendNotification(post.authorUserId.toString(), {
        type: 'comment',
        title: `${authorName} commented on your post`,
        message: data.content.substring(0, 100),
        link: `/social/posts/${postId}`,
      });
    }

    console.log(
      `[Feed] User ${session.user.id} commented on post ${postId}`
    );

    return successResponse(
      {
        comment: commentWithAuthor,
        broadcast: true,
        wsEvent: WSEventType.POST_COMMENT,
      },
      201
    );
  } catch (error) {
    console.error('Error creating comment:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * DELETE /api/social/comments
 * Remove comment from post
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    const userId = parseInt(session.user.id, 10);

    const { searchParams } = new URL(request.url);
    const commentId = parseInt(searchParams.get('commentId') || '0', 10);

    if (!commentId) {
      return errorResponse('Comment ID required', 400);
    }

    const [comment] = await db
      .select({ id: schema.socialComments.id, userId: schema.socialComments.userId })
      .from(schema.socialComments)
      .where(eq(schema.socialComments.id, commentId))
      .limit(1);

    if (!comment) {
      return errorResponse('Comment not found', 404);
    }

    if (comment.userId !== userId) {
      return errorResponse('You can only delete your own comments', 403);
    }

    // Delete comment
    await deleteComment(commentId);

    // Broadcast comment deletion
    broadcastToUniverse('social', WSEventType.POST_COMMENT, {
      id: commentId,
      action: 'delete',
      deletedAt: new Date().toISOString(),
    });

    console.log(
      `[Feed] User ${session.user.id} deleted comment ${commentId}`
    );

    return successResponse({
      success: true,
      commentId,
      broadcast: true,
      wsEvent: WSEventType.POST_COMMENT,
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return errorResponse('Internal server error', 500);
  }
}
