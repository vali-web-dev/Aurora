import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getPostReactions,
  createReaction,
  deleteReaction,
} from '@/lib/api-data';
import { reactionCreateSchema } from '@/lib/validations';
import {
  validateRequestBody,
  successResponse,
  errorResponse,
} from '@/lib/request-validation';
import {
  broadcastToUniverse,
  sendNotification,
  getUserSockets,
} from '@/lib/websocket-server';
import { WSEventType } from '@/lib/websocket-types';

/**
 * GET /api/social/reactions
 * Get reactions for a post
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = parseInt(searchParams.get('postId') || '0', 10);

    if (!postId) {
      return errorResponse('Post ID required', 400);
    }

    const reactions = await getPostReactions(postId);

    return successResponse({
      postId,
      reactions,
      summary: reactions.reduce((acc: any, r: any) => {
        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * POST /api/social/reactions
 * Add reaction to post with real-time broadcast
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    const validation = await validateRequestBody(request, reactionCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const data = validation.data as any;
    const postId = data.postId as number;

    // Create reaction
    const reaction = await createReaction({
      postId,
      userId: parseInt(session.user.id, 10),
      emoji: data.emoji,
    });

    // Broadcast reaction to all feed subscribers
    broadcastToUniverse('social', WSEventType.POST_REACTION, {
      postId,
      userId: parseInt(session.user.id, 10),
      emoji: data.emoji,
      action: 'add',
      timestamp: new Date().toISOString(),
      author: {
        id: session.user.id,
        name: session.user.name,
      },
    });

    // Send notification to post author (if not self-reaction)
    // TODO: Get post author ID from database
    // if (postAuthorId !== session.user.id) {
    //   sendNotification(postAuthorId, {
    //     type: 'reaction',
    //     title: `${session.user.name} reacted to your post`,
    //     message: `Reacted with ${data.emoji}`,
    //     link: `/social/posts/${postId}`,
    //   });
    // }

    console.log(
      `[Feed] User ${session.user.id} reacted to post ${postId} with ${data.emoji}`
    );

    return successResponse(
      {
        reaction,
        broadcast: true,
        wsEvent: WSEventType.POST_REACTION,
      },
      201
    );
  } catch (error) {
    console.error('Error creating reaction:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * DELETE /api/social/reactions
 * Remove reaction from post
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    const postId = parseInt(searchParams.get('postId') || '0', 10);
    const emoji = searchParams.get('emoji');

    if (!postId || !emoji) {
      return errorResponse('Post ID and emoji required', 400);
    }

    // Delete reaction
    await deleteReaction(
      postId,
      parseInt(session.user.id, 10),
      emoji
    );

    // Broadcast reaction removal
    broadcastToUniverse('social', WSEventType.POST_REACTION, {
      postId,
      userId: parseInt(session.user.id, 10),
      emoji,
      action: 'remove',
      timestamp: new Date().toISOString(),
    });

    console.log(
      `[Feed] User ${session.user.id} removed ${emoji} reaction from post ${postId}`
    );

    return successResponse({
      success: true,
      postId,
      emoji,
      broadcast: true,
      wsEvent: WSEventType.POST_REACTION,
    });
  } catch (error) {
    console.error('Error deleting reaction:', error);
    return errorResponse('Internal server error', 500);
  }
}
