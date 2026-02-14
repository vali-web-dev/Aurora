import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/api-data';
import { serviceCreateSchema } from '@/lib/validations';
import { validateRequestBody, successResponse, errorResponse } from '@/lib/request-validation';

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
    const validation = await validateRequestBody(request, serviceCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    // TODO: Implement create logic with admin check
    return errorResponse('Not implemented yet', 501);
  } catch (error) {
    console.error('Error creating service:', error);
    return errorResponse('Internal server error', 500);
  }
}
