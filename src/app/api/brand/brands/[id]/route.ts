import { NextRequest, NextResponse } from 'next/server';
import { getBrand } from '@/lib/api-data';

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
      return NextResponse.json(
        { error: 'Invalid brand ID' },
        { status: 400 }
      );
    }

    const brand = await getBrand(brandId);

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
