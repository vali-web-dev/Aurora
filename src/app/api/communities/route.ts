import { NextRequest, NextResponse } from 'next/server';
import { getCommunities, getCommunity, getCommunityMembers } from '@/lib/api-data';

/**
 * GET /api/communities
 * Get all communities
 */
export async function GET(request: NextRequest) {
  try {
    const communities = await getCommunities();
    return NextResponse.json(communities);
  } catch (error) {
    console.error('Error fetching communities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/communities
 * Create a new community
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // TODO: Implement create logic with auth check
    return NextResponse.json(
      { error: 'Not implemented yet' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error creating community:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
