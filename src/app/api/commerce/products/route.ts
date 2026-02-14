import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/api-data';
import { productCreateSchema } from '@/lib/validations';
import { validateRequestBody, successResponse, errorResponse } from '@/lib/request-validation';

/**
 * GET /api/commerce/products
 * Get all products
 */
export async function GET(request: NextRequest) {
  try {
    const products = await getProducts();
    return successResponse(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * POST /api/commerce/products
 * Create a new product (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const validation = await validateRequestBody(request, productCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    // TODO: Implement create logic with admin check
    return errorResponse('Not implemented yet', 501);
  } catch (error) {
    console.error('Error creating product:', error);
    return errorResponse('Internal server error', 500);
  }
}
