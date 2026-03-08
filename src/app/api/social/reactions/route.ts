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
} from '@/lib/websocket-server';
import { WSEventType } from '@/lib/websocket-types';
import { db } from '@/lib/db';
import * as schema from '@/lib/schema';
import { eq } from 'drizzle-orm';
import type { z } from 'zod';

type ReactionCreatePayload = z.infer<typeof reactionCreateSchema>;

interface EmojiReaction {
  emoji: string;
}

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
      summary: reactions.reduce<Record<string, number>>((acc, r) => {
        const reaction = r as EmojiReaction;
        acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
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

    const userId = parseInt(session.user.id, 10);

    const validation = await validateRequestBody(request, reactionCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const data = validation.data as ReactionCreatePayload;
    const postId = data.postId;

    const [post] = await db
      .select({ id: schema.socialPosts.id, authorUserId: schema.socialPosts.authorUserId })
      .from(schema.socialPosts)
      .where(eq(schema.socialPosts.id, postId))
      .limit(1);

    if (!post) {
      return errorResponse('Post not found', 404);
    }

    // Create reaction
    const reaction = await createReaction({
      postId,
      userId,
      emoji: data.emoji,
    });

    // Broadcast reaction to all feed subscribers
    broadcastToUniverse('social', WSEventType.POST_REACTION, {
      postId,
      userId,
      emoji: data.emoji,
      action: 'add',
      timestamp: new Date().toISOString(),
      author: {
        id: session.user.id,
        name: session.user.name,
      },
    });

    if (post.authorUserId !== userId) {
      const actorName = session.user.name || session.user.email || 'Someone';
      sendNotification(post.authorUserId.toString(), {
        type: 'reaction',
        title: `${actorName} reacted to your post`,
        message: `Reacted with ${data.emoji}`,
        link: `/social/posts/${postId}`,
      });
    }

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

    const userId = parseInt(session.user.id, 10);
    const { searchParams } = new URL(request.url);
    const postId = parseInt(searchParams.get('postId') || '0', 10);
    const emoji = searchParams.get('emoji');

    if (!postId || !emoji) {
      return errorResponse('Post ID and emoji required', 400);
    }

    // Delete reaction
    await deleteReaction(
      postId,
      userId,
      emoji
    );

    // Broadcast reaction removal
    broadcastToUniverse('social', WSEventType.POST_REACTION, {
      postId,
      userId,
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
