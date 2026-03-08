import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import * as schema from '@/lib/schema';
import { getProducts } from '@/lib/api-data';
import { productCreateSchema } from '@/lib/validations';
import { validateRequestBody, successResponse, errorResponse } from '@/lib/request-validation';

function getAdminAllowlist(): string[] {
  const multi = (process.env.AURORA_ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const single = [process.env.AURORA_ADMIN_EMAIL, process.env.ADMIN_EMAIL]
    .map((value) => (value || '').trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set([...multi, ...single]));
}

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
    const session = await auth();
    const email = session?.user?.email?.trim().toLowerCase() || '';
    const allowlist = getAdminAllowlist();

    if (!session?.user?.id || !email) {
      return errorResponse('Authentication required', 401);
    }
    if (!allowlist.includes(email)) {
      return errorResponse('Forbidden: admin access required', 403);
    }

    const validation = await validateRequestBody(request, productCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const data = validation.data as {
      title: string;
      description?: string;
      priceCents: number;
      currency: string;
      imageUrl?: string;
      metadata?: Record<string, unknown>;
    };

    const providerId = Number((data.metadata as { providerId?: unknown } | undefined)?.providerId);
    if (!Number.isInteger(providerId) || providerId <= 0) {
      return errorResponse('metadata.providerId is required and must be a positive integer', 400);
    }

    const [product] = await db
      .insert(schema.products)
      .values({
        providerId,
        title: data.title,
        description: data.description ?? null,
        priceCents: data.priceCents,
        currency: data.currency,
        imageUrl: data.imageUrl ?? null,
        url: (data.metadata as { url?: string } | undefined)?.url ?? null,
        metadata: data.metadata ?? {},
      })
      .returning();

    return successResponse({ product }, 201);
  } catch (error) {
    console.error('Error creating product:', error);
    return errorResponse('Internal server error', 500);
  }
}
