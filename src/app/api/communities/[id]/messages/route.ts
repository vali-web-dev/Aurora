import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getCommunityMessages,
  createMessage,
  updateMessage,
  deleteMessage,
} from '@/lib/api-data';
import { db } from '@/lib/db';
import * as schema from '@/lib/schema';
import { and, eq } from 'drizzle-orm';
import { messageCreateSchema, messageUpdateSchema } from '@/lib/validations';
import {
  validateRequestBody,
  successResponse,
  errorResponse,
} from '@/lib/request-validation';
import {
  broadcastToCommunity,
  sendNotification,
} from '@/lib/websocket-server';
import { WSEventType } from '@/lib/websocket-types';
import type { z } from 'zod';

type MessageCreatePayload = z.infer<typeof messageCreateSchema>;
type MessageUpdatePayload = z.infer<typeof messageUpdateSchema>;

/**
 * GET /api/communities/[id]/messages
 * Get chat messages for a community
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    const communityId = parseInt(params.id, 10);
    if (isNaN(communityId)) {
      return errorResponse('Invalid community ID', 400);
    }

    const userId = parseInt(session.user.id, 10);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const [membership] = await db
      .select({ id: schema.communityMembers.id })
      .from(schema.communityMembers)
      .where(
        and(
          eq(schema.communityMembers.communityId, communityId),
          eq(schema.communityMembers.userId, userId)
        )
      )
      .limit(1);

    if (!membership) {
      return errorResponse('Not a member of this community', 403);
    }

    const messages = await getCommunityMessages(communityId, limit, offset);

    return successResponse({
      communityId,
      messages,
      pagination: {
        limit,
        offset,
        hasMore: messages.length === limit,
      },
      realTime: true,
      wsEvents: [
        WSEventType.MESSAGE,
        WSEventType.MESSAGE_EDITED,
        WSEventType.MESSAGE_DELETED,
        WSEventType.TYPING_INDICATOR,
      ],
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * POST /api/communities/[id]/messages
 * Send a new message to community chat
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    const communityId = parseInt(params.id, 10);
    if (isNaN(communityId)) {
      return errorResponse('Invalid community ID', 400);
    }

    const userId = parseInt(session.user.id, 10);
    const validation = await validateRequestBody(request, messageCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const data = validation.data as MessageCreatePayload;

    const [membership] = await db
      .select({ id: schema.communityMembers.id })
      .from(schema.communityMembers)
      .where(
        and(
          eq(schema.communityMembers.communityId, communityId),
          eq(schema.communityMembers.userId, userId)
        )
      )
      .limit(1);

    if (!membership) {
      return errorResponse('Not a member of this community', 403);
    }

    // Create message
    const message = await createMessage({
      communityId,
      userId,
      content: data.content,
      metadata: data.metadata || {},
    });

    // Broadcast to all community members
    broadcastToCommunity(communityId.toString(), WSEventType.MESSAGE, {
      id: message.id,
      communityId,
      userId,
      content: data.content,
      metadata: data.metadata || {},
      createdAt: message.createdAt,
      author: {
        id: session.user.id,
        name: session.user.name,
      },
    });

    // Send notifications to @mentioned users
    if (data.mentions && data.mentions.length > 0) {
      for (const mentionedUserId of data.mentions) {
        sendNotification(mentionedUserId, {
          type: 'mention',
          title: `${session.user.name} mentioned you`,
          message: data.content.substring(0, 100),
          link: `/communities/${communityId}`,
        });
      }
    }

    console.log(
      `[Chat] Message sent by user ${session.user.id} in community ${communityId}`
    );

    return successResponse(
      {
        message,
        broadcast: true,
        wsEvent: WSEventType.MESSAGE,
      },
      201
    );
  } catch (error) {
    console.error('Error creating message:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * PUT /api/communities/[id]/messages
 * Edit a message
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    const communityId = parseInt(params.id, 10);
    if (isNaN(communityId)) {
      return errorResponse('Invalid community ID', 400);
    }

    const userId = parseInt(session.user.id, 10);
    const validation = await validateRequestBody(request, messageUpdateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const data = validation.data as MessageUpdatePayload;
    const messageId = parseInt(data.messageId, 10);

    const [message] = await db
      .select({ id: schema.communityMessages.id, userId: schema.communityMessages.userId })
      .from(schema.communityMessages)
      .where(
        and(
          eq(schema.communityMessages.id, messageId),
          eq(schema.communityMessages.communityId, communityId)
        )
      )
      .limit(1);

    if (!message) {
      return errorResponse('Message not found', 404);
    }

    if (message.userId !== userId) {
      return errorResponse('You can only edit your own messages', 403);
    }

    // Update message
    const updatedMessage = await updateMessage(messageId, {
      content: data.content,
      edited: true,
    });

    // Broadcast update
    broadcastToCommunity(communityId.toString(), WSEventType.MESSAGE_EDITED, {
      id: messageId,
      communityId,
      userId,
      content: data.content,
      edited: true,
      updatedAt: new Date().toISOString(),
    });

    console.log(
      `[Chat] Message ${messageId} edited by user ${session.user.id}`
    );

    return successResponse({
      message: updatedMessage,
      broadcast: true,
      wsEvent: WSEventType.MESSAGE_EDITED,
    });
  } catch (error) {
    console.error('Error updating message:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * DELETE /api/communities/[id]/messages
 * Delete a message
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    const communityId = parseInt(params.id, 10);
    if (isNaN(communityId)) {
      return errorResponse('Invalid community ID', 400);
    }

    const userId = parseInt(session.user.id, 10);
    const { searchParams } = new URL(request.url);
    const messageId = parseInt(searchParams.get('messageId') || '0', 10);

    if (!messageId) {
      return errorResponse('Message ID required', 400);
    }

    const [message] = await db
      .select({ id: schema.communityMessages.id, userId: schema.communityMessages.userId })
      .from(schema.communityMessages)
      .where(
        and(
          eq(schema.communityMessages.id, messageId),
          eq(schema.communityMessages.communityId, communityId)
        )
      )
      .limit(1);

    if (!message) {
      return errorResponse('Message not found', 404);
    }

    const [membership] = await db
      .select({ role: schema.communityMembers.role })
      .from(schema.communityMembers)
      .where(
        and(
          eq(schema.communityMembers.communityId, communityId),
          eq(schema.communityMembers.userId, userId)
        )
      )
      .limit(1);

    if (!membership) {
      return errorResponse('Not a member of this community', 403);
    }

    const elevatedRoles = new Set(['admin', 'owner', 'moderator']);
    const roleValue = (membership.role || '').toLowerCase();
    const canDelete = message.userId === userId || elevatedRoles.has(roleValue);
    if (!canDelete) {
      return errorResponse('You can only delete your own messages', 403);
    }

    // Delete message
    await deleteMessage(messageId);

    // Broadcast deletion
    broadcastToCommunity(communityId.toString(), WSEventType.MESSAGE_DELETED, {
      id: messageId,
      communityId,
      deletedAt: new Date().toISOString(),
    });

    console.log(
      `[Chat] Message ${messageId} deleted by user ${session.user.id}`
    );

    return successResponse({
      success: true,
      messageId,
      broadcast: true,
      wsEvent: WSEventType.MESSAGE_DELETED,
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return errorResponse('Internal server error', 500);
  }
}
