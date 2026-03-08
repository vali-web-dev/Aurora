import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import * as schema from '@/lib/schema';
import { getBrands } from '@/lib/api-data';
import { brandCreateSchema } from '@/lib/validations';
import { validateRequestBody, successResponse, errorResponse } from '@/lib/request-validation';

/**
 * GET /api/brand/brands
 * Get all brands
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    let brands;
    if (userId) {
      brands = await getBrands(parseInt(userId));
    } else {
      brands = await getBrands();
    }

    return successResponse(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * POST /api/brand/brands
 * Create a new brand
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    const ownerUserId = Number.parseInt(session.user.id, 10);
    if (!Number.isInteger(ownerUserId) || ownerUserId <= 0) {
      return errorResponse('Invalid user session', 400);
    }

    const validation = await validateRequestBody(request, brandCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const data = validation.data as {
      name: string;
      slug: string;
      story?: string;
      values?: string;
      tone?: string;
      archetype?: string;
    };

    const [brand] = await db
      .insert(schema.brands)
      .values({
        ownerUserId,
        name: data.name,
        slug: data.slug,
        story: data.story ?? null,
        values: data.values ?? null,
        tone: data.tone ?? null,
        archetype: data.archetype ?? null,
      })
      .returning();

    return successResponse({ brand }, 201);
  } catch (error) {
    console.error('Error creating brand:', error);
    return errorResponse('Internal server error', 500);
  }
}
