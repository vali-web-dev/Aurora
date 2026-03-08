import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import * as schema from '@/lib/schema';
import { getServices } from '@/lib/api-data';
import { serviceCreateSchema } from '@/lib/validations';
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
 * GET /api/services
 * Get all available services
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    let services = await getServices();

    if (category) {
      services = services.filter(s => s.category === category);
    }

    return successResponse(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * POST /api/services
 * Register a new service (admin only)
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

    const validation = await validateRequestBody(request, serviceCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const data = validation.data as {
      name: string;
      category: string;
      description?: string;
      homepageUrl?: string;
      embedType?: 'iframe' | 'widget' | 'api' | 'webhook';
    };

    const [service] = await db
      .insert(schema.services)
      .values({
        name: data.name,
        category: data.category,
        description: data.description ?? null,
        homepageUrl: data.homepageUrl ?? null,
        embedType: data.embedType ?? null,
      })
      .returning();

    return successResponse({ service }, 201);
  } catch (error) {
    console.error('Error creating service:', error);
    return errorResponse('Internal server error', 500);
  }
}
