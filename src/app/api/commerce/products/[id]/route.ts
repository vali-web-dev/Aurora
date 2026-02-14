import { NextRequest, NextResponse } from 'next/server';
import { getProduct } from '@/lib/api-data';
import { successResponse, errorResponse } from '@/lib/request-validation';

/**
 * GET /api/commerce/products/[id]
 * Get product details by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return errorResponse('Invalid product ID', 400);
    }

    const product = await getProduct(productId);

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    return successResponse(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return errorResponse('Internal server error', 500);
  }
}
