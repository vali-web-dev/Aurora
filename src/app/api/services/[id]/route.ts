import { NextRequest, NextResponse } from 'next/server';
import { getService } from '@/lib/api-data';
import { successResponse, errorResponse } from '@/lib/request-validation';

/**
 * GET /api/services/[id]
 * Get service details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = parseInt(params.id);

    if (isNaN(serviceId)) {
      return errorResponse('Invalid service ID', 400);
    }

    const service = await getService(serviceId);

    if (!service) {
      return errorResponse('Service not found', 404);
    }

    return successResponse(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return errorResponse('Internal server error', 500);
  }
}
