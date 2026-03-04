/**
 * Confirm Payment API Route
 * POST /api/payments/confirm - Confirm a payment
 */

import { NextRequest, NextResponse } from 'next/server';
import paymentService from '@/lib/payments/service';
import { PaymentProvider } from '@/lib/payments/types';

export async function POST(req: NextRequest) {
  try {
    const { intentId, paymentMethodId, provider } = await req.json();

    if (!intentId || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Intent ID and payment method ID required' },
        { status: 400 }
      );
    }

    const confirmation = await paymentService.confirmPayment(
      intentId,
      paymentMethodId,
      provider as PaymentProvider
    );

    if (confirmation.status === 'succeeded') {
      // TODO: Update order status to 'paid'
      // TODO: Trigger fulfillment workflow
      return NextResponse.json({
        ...confirmation,
        orderId: confirmation.metadata?.orderId,
      });
    }

    return NextResponse.json(confirmation);
  } catch (error: any) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
