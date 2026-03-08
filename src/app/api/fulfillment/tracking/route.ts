/**
 * Tracking API Route
 * GET /api/fulfillment/tracking - Get tracking information for a shipment
 */

import { NextRequest } from 'next/server';
import fulfillmentService from '@/lib/fulfillment/service';
import { Carrier } from '@/lib/fulfillment/types';
import { errorResponse, successResponse, validateQuery } from '@/lib/request-validation';
import { fulfillmentTrackingQuerySchema } from '@/lib/validations';
import type { z } from 'zod';

type TrackingQueryPayload = z.infer<typeof fulfillmentTrackingQuerySchema>;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryValidation = validateQuery<TrackingQueryPayload>(
      searchParams,
      fulfillmentTrackingQuerySchema
    );
    if (!queryValidation.success) {
      return errorResponse(queryValidation.error, 400);
    }

    const { trackingNumber, carrier } = queryValidation.data;

    try {
      const shipment = await fulfillmentService.getTracking(trackingNumber, carrier);

      return successResponse({
        shipment,
        lastEvent: shipment.events[shipment.events.length - 1] || null,
        status: shipment.status,
        isDelivered: shipment.status === 'delivered',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('not found')) {
        return errorResponse('Tracking number not found', 404);
      }
      if (message.includes('mock adapter cannot execute')) {
        return errorResponse('Carrier unavailable in live fulfillment mode', 503);
      }
      throw error;
    }
  } catch (error: unknown) {
    console.error('Tracking error:', error);
    return errorResponse('Failed to fetch tracking details', 500);
  }
}
