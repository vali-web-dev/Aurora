import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import * as schema from '@/lib/schema';
import { getPlaylists } from '@/lib/api-data';
import { playlistCreateSchema } from '@/lib/validations';
import { validateRequestBody, successResponse, errorResponse } from '@/lib/request-validation';

/**
 * GET /api/entertainment/playlists
 * Get all playlists for a user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return errorResponse('userId query parameter is required', 400);
    }

    const playlists = await getPlaylists(parseInt(userId));
    return successResponse(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * POST /api/entertainment/playlists
 * Create a new playlist
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

    const validation = await validateRequestBody(request, playlistCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const data = validation.data as {
      title: string;
      description?: string;
      type?: 'playlist' | 'watch-later' | 'favorites';
    };

    const [playlist] = await db
      .insert(schema.playlists)
      .values({
        ownerUserId: userId,
        title: data.title,
        description: data.description ?? null,
        type: data.type ?? 'playlist',
      })
      .returning();

    return successResponse({ playlist }, 201);
  } catch (error) {
    console.error('Error creating playlist:', error);
    return errorResponse('Internal server error', 500);
  }
}
