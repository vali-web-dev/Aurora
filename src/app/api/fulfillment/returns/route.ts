/**
 * Returns API Route
 * POST /api/fulfillment/returns - Initiate a return
 */

import { NextRequest } from 'next/server';
import fulfillmentService from '@/lib/fulfillment/service';
import { Carrier } from '@/lib/fulfillment/types';
import { errorResponse, successResponse, validateRequestBody } from '@/lib/request-validation';
import { fulfillmentReturnSchema } from '@/lib/validations';
import type { z } from 'zod';

type ReturnPayload = z.infer<typeof fulfillmentReturnSchema>;

export async function POST(req: NextRequest) {
  try {
    const validation = await validateRequestBody(req, fulfillmentReturnSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { trackingNumber, carrier, reason } = validation.data as ReturnPayload;

    try {
      const returnLabel = await fulfillmentService.initiateReturn(trackingNumber, carrier);

      return successResponse({
        success: true,
        returnTrackingNumber: returnLabel.returnTrackingNumber,
        returnLabelUrl: returnLabel.labelUrl,
        instructions: {
          step1: 'Download and print your return label',
          step2: 'Pack the item securely using the original packaging if available',
          step3: 'Affix the return label to the outside of the package',
          step4: 'Drop off at any carrier location',
        },
        reason,
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
    console.error('Return initiation error:', error);
    return errorResponse('Failed to initiate return', 500);
  }
}
