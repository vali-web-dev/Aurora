import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import * as schema from '@/lib/schema';
import { getCommunities } from '@/lib/api-data';
import { communityCreateSchema } from '@/lib/validations';
import { errorResponse, successResponse, validateRequestBody } from '@/lib/request-validation';

/**
 * GET /api/communities
 * Get all communities
 */
export async function GET(request: NextRequest) {
  try {
    const communities = await getCommunities();
    return successResponse(communities);
  } catch (error) {
    console.error('Error fetching communities:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * POST /api/communities
 * Create a new community
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

    const validation = await validateRequestBody(request, communityCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const data = validation.data as {
      name: string;
      slug: string;
      description: string;
      visibility: 'public' | 'private';
    };

    const [community] = await db
      .insert(schema.communities)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description,
        visibility: data.visibility,
      })
      .returning();

    if (community?.id) {
      await db.insert(schema.communityMembers).values({
        communityId: community.id,
        userId,
        role: 'admin',
      });
    }

    return successResponse({ community }, 201);
  } catch (error) {
    console.error('Error creating community:', error);
    return errorResponse('Internal server error', 500);
  }
}
