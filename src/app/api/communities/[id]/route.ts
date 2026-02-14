import { NextRequest, NextResponse } from 'next/server';
import { getCommunity, getCommunityMembers } from '@/lib/api-data';
import { successResponse, errorResponse } from '@/lib/request-validation';

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
      return errorResponse('Invalid community ID', 400);
    }

    const community = await getCommunity(communityId);

    if (!community) {
      return errorResponse('Community not found', 404);
    }

    const members = await getCommunityMembers(communityId);

    return successResponse({
      ...community,
      members,
      memberCount: members.length,
    });
  } catch (error) {
    console.error('Error fetching community:', error);
    return errorResponse('Internal server error', 500);
  }
}
