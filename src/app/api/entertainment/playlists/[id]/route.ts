import { NextRequest, NextResponse } from 'next/server';
import { getPlaylist, getPlaylistItems } from '@/lib/api-data';

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
      return NextResponse.json(
        { error: 'Invalid playlist ID' },
        { status: 400 }
      );
    }

    const playlist = await getPlaylist(playlistId);

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    const items = await getPlaylistItems(playlistId);

    return NextResponse.json({
      ...playlist,
      items,
      itemCount: items.length,
    });
  } catch (error) {
    console.error('Error fetching playlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
