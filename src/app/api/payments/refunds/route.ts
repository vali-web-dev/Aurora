/**
 * Refunds API Route
 * POST /api/payments/refunds - Create a refund
 */

import { NextRequest } from 'next/server';
import paymentService from '@/lib/payments/service';
import { PaymentProvider } from '@/lib/payments/types';
import { errorResponse, successResponse, validateRequestBody } from '@/lib/request-validation';
import { paymentRefundSchema } from '@/lib/validations';
import type { z } from 'zod';

type PaymentRefundPayload = z.infer<typeof paymentRefundSchema>;

export async function POST(req: NextRequest) {
  try {
    const validation = await validateRequestBody(req, paymentRefundSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { chargeId, amount, reason, provider } = validation.data as PaymentRefundPayload;

    const refund = await paymentService.refundPayment(
      chargeId,
      amount,
      reason,
      provider as PaymentProvider
    );

    return successResponse({ refund });
  } catch (error: unknown) {
    console.error('Refund error:', error);
    const message = error instanceof Error ? error.message : '';
    if (message.includes('not found')) {
      return errorResponse('Charge or provider not found', 404);
    }
    return errorResponse('Failed to create refund', 500);
  }
}
