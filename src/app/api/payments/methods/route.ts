/**
 * Payment Methods API Route
 * GET /api/payments/methods - List payment methods
 * POST /api/payments/methods - Save a payment method
 * DELETE /api/payments/methods/[id] - Delete a payment method
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
  paymentMethodDeleteQuerySchema,
  paymentMethodsListQuerySchema,
  paymentMethodSaveSchema,
} from '@/lib/validations';
import type { z } from 'zod';

type PaymentMethodsListQuery = z.infer<typeof paymentMethodsListQuerySchema>;
type PaymentMethodSavePayload = z.infer<typeof paymentMethodSaveSchema>;
type PaymentMethodDeleteQuery = z.infer<typeof paymentMethodDeleteQuerySchema>;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryValidation = validateQuery<PaymentMethodsListQuery>(
      searchParams,
      paymentMethodsListQuerySchema
    );

    if (!queryValidation.success) {
      return errorResponse(queryValidation.error, 400);
    }

    const { customerId, provider } = queryValidation.data;

    const methods = await paymentService.listPaymentMethods(customerId, provider);

    return successResponse({ methods });
  } catch (error: unknown) {
    console.error('List payment methods error:', error);
    const message = error instanceof Error ? error.message : '';
    if (message.includes('not found')) {
      return errorResponse('Customer or provider not found', 404);
    }
    return errorResponse('Failed to list payment methods', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const validation = await validateRequestBody(req, paymentMethodSaveSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { customerId, paymentMethodData, provider } = validation.data as PaymentMethodSavePayload;

    const method = await paymentService.savePaymentMethod(
      customerId,
      paymentMethodData,
      provider as PaymentProvider
    );

    return successResponse({ method });
  } catch (error: unknown) {
    console.error('Save payment method error:', error);
    const message = error instanceof Error ? error.message : '';
    if (message.includes('not found')) {
      return errorResponse('Payment provider not found', 404);
    }
    return errorResponse('Failed to save payment method', 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryValidation = validateQuery<PaymentMethodDeleteQuery>(
      searchParams,
      paymentMethodDeleteQuerySchema
    );

    if (!queryValidation.success) {
      return errorResponse(queryValidation.error, 400);
    }

    const { id: paymentMethodId, provider } = queryValidation.data;

    await paymentService.deletePaymentMethod(paymentMethodId, provider);

    return successResponse({ success: true });
  } catch (error: unknown) {
    console.error('Delete payment method error:', error);
    const message = error instanceof Error ? error.message : '';
    if (message.includes('not found')) {
      return errorResponse('Payment method or provider not found', 404);
    }
    return errorResponse('Failed to delete payment method', 500);
  }
}
