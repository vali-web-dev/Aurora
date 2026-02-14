import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getProduct } from '@/lib/api-data';

/**
 * GET /api/commerce/products
 * Get all products
 */
export async function GET(request: NextRequest) {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/commerce/products
 * Create a new product (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, image } = body;

    if (!name || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Implement create logic with admin check
    return NextResponse.json(
      { error: 'Not implemented yet' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
