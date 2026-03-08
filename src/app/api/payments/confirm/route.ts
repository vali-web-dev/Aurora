/**
 * Confirm Payment API Route
 * POST /api/payments/confirm - Confirm a payment
 */

import { NextRequest } from 'next/server';
import paymentService from '@/lib/payments/service';
import { PaymentProvider } from '@/lib/payments/types';
import { db } from '@/lib/db';
import * as schema from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { errorResponse, successResponse, validateRequestBody } from '@/lib/request-validation';
import { paymentConfirmSchema } from '@/lib/validations';
import type { z } from 'zod';

type PaymentConfirmPayload = z.infer<typeof paymentConfirmSchema>;

async function findOrderByMetadataOrderId(orderIdValue: unknown) {
  if (typeof orderIdValue === 'number' && Number.isInteger(orderIdValue)) {
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderIdValue))
      .limit(1);
    return order || null;
  }

  if (typeof orderIdValue === 'string') {
    const parsed = Number.parseInt(orderIdValue, 10);
    if (Number.isInteger(parsed)) {
      const [order] = await db
        .select()
        .from(schema.orders)
        .where(eq(schema.orders.id, parsed))
        .limit(1);
      return order || null;
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const validation = await validateRequestBody(req, paymentConfirmSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { intentId, paymentMethodId, provider } = validation.data as PaymentConfirmPayload;

    const confirmation = await paymentService.confirmPayment(
      intentId,
      paymentMethodId,
      provider as PaymentProvider
    );

    const metadataOrderId = confirmation.metadata?.orderId;
    const resolvedOrder = await findOrderByMetadataOrderId(metadataOrderId);

    if (confirmation.status === 'succeeded') {
      if (resolvedOrder) {
        await db
          .update(schema.orders)
          .set({
            status: 'paid',
            providerPayload: {
              ...(resolvedOrder.providerPayload || {}),
              intentId,
              provider: provider ?? 'stripe',
              paidAt: new Date().toISOString(),
            },
          })
          .where(eq(schema.orders.id, resolvedOrder.id));

        await db.insert(schema.payments).values({
          orderId: resolvedOrder.id,
          method: provider ?? 'stripe',
          amountCents: resolvedOrder.totalCents || 0,
          currency: resolvedOrder.currency || 'USD',
          status: 'succeeded',
          metadata: {
            intentId,
            confirmation,
          },
        });

        await db.insert(schema.notifications).values({
          userId: resolvedOrder.userId,
          kind: 'payment_success',
          title: 'Payment confirmed',
          body: `Order ${resolvedOrder.id} payment completed successfully.`,
          payload: {
            orderId: resolvedOrder.id,
            intentId,
          },
          read: false,
        });
      }

      return successResponse({
        ...confirmation,
        orderId: confirmation.metadata?.orderId,
      });
    }

    if (confirmation.status === 'failed' && resolvedOrder) {
      await db
        .update(schema.orders)
        .set({
          status: 'payment_failed',
          providerPayload: {
            ...(resolvedOrder.providerPayload || {}),
            intentId,
            provider: provider ?? 'stripe',
            failedAt: new Date().toISOString(),
          },
        })
        .where(eq(schema.orders.id, resolvedOrder.id));

      await db.insert(schema.payments).values({
        orderId: resolvedOrder.id,
        method: provider ?? 'stripe',
        amountCents: resolvedOrder.totalCents || 0,
        currency: resolvedOrder.currency || 'USD',
        status: 'failed',
        metadata: {
          intentId,
          confirmation,
        },
      });
    }

    return successResponse(confirmation);
  } catch (error: unknown) {
    console.error('Payment confirmation error:', error);
    const message = error instanceof Error ? error.message : '';
    if (message.includes('not found')) {
      return errorResponse('Payment intent, method, or provider not found', 404);
    }
    return errorResponse('Failed to confirm payment', 500);
  }
}
