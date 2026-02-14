import { NextRequest, NextResponse } from 'next/server';
import { getCommunity, getCommunityMembers } from '@/lib/api-data';

/**
 * GET /api/communities/[id]
 * Get community details with members
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const communityId = parseInt(params.id);

    if (isNaN(communityId)) {
      return NextResponse.json(
        { error: 'Invalid community ID' },
        { status: 400 }
      );
    }

    const community = await getCommunity(communityId);

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    const members = await getCommunityMembers(communityId);

    return NextResponse.json({
      ...community,
      members,
      memberCount: members.length,
    });
  } catch (error) {
    console.error('Error fetching community:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
