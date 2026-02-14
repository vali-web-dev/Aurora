import { NextRequest, NextResponse } from 'next/server';
import { getPlaylist, getPlaylistItems } from '@/lib/api-data';
import { successResponse, errorResponse } from '@/lib/request-validation';

/**
 * GET /api/entertainment/playlists/[id]
 * Get playlist with items
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playlistId = parseInt(params.id);

    if (isNaN(playlistId)) {
      return errorResponse('Invalid playlist ID', 400);
    }

    const playlist = await getPlaylist(playlistId);

    if (!playlist) {
      return errorResponse('Playlist not found', 404);
    }

    const items = await getPlaylistItems(playlistId);

    return successResponse({
      ...playlist,
      items,
      itemCount: items.length,
    });
  } catch (error) {
    console.error('Error fetching playlist:', error);
    return errorResponse('Internal server error', 500);
  }
}
