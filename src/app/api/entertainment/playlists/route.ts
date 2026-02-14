import { NextRequest, NextResponse } from 'next/server';
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
    const validation = await validateRequestBody(request, playlistCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    // TODO: Implement create logic with auth check
    return errorResponse('Not implemented yet', 501);
  } catch (error) {
    console.error('Error creating playlist:', error);
    return errorResponse('Internal server error', 500);
  }
}
