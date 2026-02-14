import { NextRequest, NextResponse } from 'next/server';
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
    const validation = await validateRequestBody(request, brandCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    // TODO: Implement create logic with auth check
    return errorResponse('Not implemented yet', 501);
  } catch (error) {
    console.error('Error creating brand:', error);
    return errorResponse('Internal server error', 500);
  }
}
