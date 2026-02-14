import { NextRequest, NextResponse } from 'next/server';
import { getBrand } from '@/lib/api-data';
import { successResponse, errorResponse } from '@/lib/request-validation';

/**
 * GET /api/brand/brands/[id]
 * Get brand details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brandId = parseInt(params.id);

    if (isNaN(brandId)) {
      return errorResponse('Invalid brand ID', 400);
    }

    const brand = await getBrand(brandId);

    if (!brand) {
      return errorResponse('Brand not found', 404);
    }

    return successResponse(brand);
  } catch (error) {
    console.error('Error fetching brand:', error);
    return errorResponse('Internal server error', 500);
  }
}
