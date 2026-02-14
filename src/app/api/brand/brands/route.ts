import { NextRequest, NextResponse } from 'next/server';
import { getBrands, getBrand } from '@/lib/api-data';

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

    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/brand/brands
 * Create a new brand
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, story } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // TODO: Implement create logic with auth check
    return NextResponse.json(
      { error: 'Not implemented yet' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
