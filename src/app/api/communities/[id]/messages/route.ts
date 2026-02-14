import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getCommunityMessages,
  createMessage,
  updateMessage,
  deleteMessage,
  getCommunityMembers,
} from '@/lib/api-data';
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

    const { searchParams } = new URL(request.url);
   const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // TODO: Verify user is member of community
    // const isMember = await isUserMemberOfCommunity(communityId, session.user.id);
    // if (!isMember) {
    //   return errorResponse('Not a member of this community', 403);
    // }

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

    const validation = await validateRequestBody(request, messageCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const data = validation.data as any;

    // TODO: Verify user is member of community
    // const isMember = await isUserMemberOfCommunity(communityId, session.user.id);
    // if (!isMember) {
    //   return errorResponse('Not a member of this community', 403);
    // }

    // Create message
    const message = await createMessage({
      communityId,
      userId: parseInt(session.user.id, 10),
      content: data.content,
      metadata: data.metadata || {},
    });

    // Broadcast to all community members
    broadcastToCommunity(communityId.toString(), WSEventType.MESSAGE, {
      id: message.id,
      communityId,
      userId: parseInt(session.user.id, 10),
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
      for (const userId of data.mentions) {
        sendNotification(userId, {
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

    const validation = await validateRequestBody(request, messageUpdateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const data = validation.data as any;
    const messageId = parseInt(data.messageId, 10);

    // TODO: Verify message ownership
    // Update message
    const updatedMessage = await updateMessage(messageId, {
      content: data.content,
      edited: true,
    });

    // Broadcast update
    broadcastToCommunity(communityId.toString(), WSEventType.MESSAGE_EDITED, {
      id: messageId,
      communityId,
      userId: parseInt(session.user.id, 10),
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

    const { searchParams } = new URL(request.url);
    const messageId = parseInt(searchParams.get('messageId') || '0', 10);

    if (!messageId) {
      return errorResponse('Message ID required', 400);
    }

    // TODO: Verify message ownership or admin status
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
