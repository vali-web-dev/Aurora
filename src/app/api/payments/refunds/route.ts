/**
 * Refunds API Route
 * POST /api/payments/refunds - Create a refund
 */

import { NextRequest, NextResponse } from 'next/server';
import paymentService from '@/lib/payments/service';
import { PaymentProvider } from '@/lib/payments/types';

export async function POST(req: NextRequest) {
  try {
    const { chargeId, amount, reason, provider } = await req.json();

    if (!chargeId) {
      return NextResponse.json(
        { error: 'Charge ID required' },
        { status: 400 }
      );
    }

    const refund = await paymentService.refundPayment(
      chargeId,
      amount,
      reason,
      provider as PaymentProvider
    );

    return NextResponse.json({ refund });
  } catch (error: any) {
    console.error('Refund error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
