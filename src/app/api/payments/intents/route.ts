/**
 * Payment Intent API Route
 * POST /api/payments/intents - Create payment intent
 * GET /api/payments/intents/[id] - Retrieve payment intent
 */

import { NextRequest } from 'next/server';
import paymentService from '@/lib/payments/service';
import { PaymentProvider } from '@/lib/payments/types';
import {
  errorResponse,
  successResponse,
  validateQuery,
  validateRequestBody,
} from '@/lib/request-validation';
import {
  paymentIntentCreateSchema,
  paymentIntentRetrieveQuerySchema,
} from '@/lib/validations';
import type { z } from 'zod';

type PaymentIntentCreatePayload = z.infer<typeof paymentIntentCreateSchema>;
type PaymentIntentRetrieveQuery = z.infer<typeof paymentIntentRetrieveQuerySchema>;

export async function POST(req: NextRequest) {
  try {
    const validation = await validateRequestBody(req, paymentIntentCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { amount, currency, metadata, provider } = validation.data as PaymentIntentCreatePayload;

    const intent = await paymentService.createPaymentIntent(
      amount,
      currency,
      metadata || {},
      provider as PaymentProvider
    );

    return successResponse(intent);
  } catch (error: unknown) {
    console.error('Payment intent creation error:', error);
    const message = error instanceof Error ? error.message : '';
    if (message.includes('not found')) {
      return errorResponse('Payment provider not found', 404);
    }
    return errorResponse('Failed to create payment intent', 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryValidation = validateQuery<PaymentIntentRetrieveQuery>(
      searchParams,
      paymentIntentRetrieveQuerySchema
    );

    if (!queryValidation.success) {
      return errorResponse(queryValidation.error, 400);
    }

    const { id: intentId, provider } = queryValidation.data;

    const intent = await paymentService.retrievePaymentIntent(intentId, provider);

    return successResponse(intent);
  } catch (error: unknown) {
    console.error('Payment intent retrieval error:', error);
    const message = error instanceof Error ? error.message : '';
    if (message.includes('not found')) {
      return errorResponse('Payment intent or provider not found', 404);
    }
    return errorResponse('Failed to retrieve payment intent', 500);
  }
}
