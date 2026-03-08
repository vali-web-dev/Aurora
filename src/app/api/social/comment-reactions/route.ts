import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getCommentReactions,
  createCommentReaction,
  deleteCommentReaction,
} from '@/lib/api-data';
import { commentReactionCreateSchema } from '@/lib/validations';
import {
  validateRequestBody,
  successResponse,
  errorResponse,
} from '@/lib/request-validation';
import { broadcastToUniverse } from '@/lib/websocket-server';
import { WSEventType } from '@/lib/websocket-types';
import type { z } from 'zod';

type CommentReactionCreatePayload = z.infer<typeof commentReactionCreateSchema>;

interface EmojiReaction {
  emoji: string;
}

/**
 * GET /api/social/comment-reactions
 * Get reactions for a comment
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = parseInt(searchParams.get('commentId') || '0', 10);

    if (!commentId) {
      return errorResponse('Comment ID required', 400);
    }

    const reactions = await getCommentReactions(commentId);

    return successResponse({
      commentId,
      reactions,
      summary: reactions.reduce<Record<string, number>>((acc, r) => {
        const reaction = r as EmojiReaction;
        acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error('Error fetching comment reactions:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * POST /api/social/comment-reactions
 * Add reaction to a comment
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    const validation = await validateRequestBody(request, commentReactionCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const data = validation.data as CommentReactionCreatePayload;
    const commentId = data.commentId;

    const reaction = await createCommentReaction({
      commentId,
      userId: parseInt(session.user.id, 10),
      emoji: data.emoji,
    });

    broadcastToUniverse('social', WSEventType.POST_COMMENT, {
      commentId,
      userId: parseInt(session.user.id, 10),
      emoji: data.emoji,
      action: 'reaction:add',
      timestamp: new Date().toISOString(),
    });

    return successResponse(
      {
        reaction,
        broadcast: true,
      },
      201
    );
  } catch (error) {
    console.error('Error creating comment reaction:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * DELETE /api/social/comment-reactions
 * Remove reaction from a comment
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    const commentId = parseInt(searchParams.get('commentId') || '0', 10);
    const emoji = searchParams.get('emoji');

    if (!commentId || !emoji) {
      return errorResponse('Comment ID and emoji required', 400);
    }

    await deleteCommentReaction(commentId, parseInt(session.user.id, 10), emoji);

    broadcastToUniverse('social', WSEventType.POST_COMMENT, {
      commentId,
      userId: parseInt(session.user.id, 10),
      emoji,
      action: 'reaction:remove',
      timestamp: new Date().toISOString(),
    });

    return successResponse({
      success: true,
      commentId,
      emoji,
      broadcast: true,
    });
  } catch (error) {
    console.error('Error deleting comment reaction:', error);
    return errorResponse('Internal server error', 500);
  }
}
