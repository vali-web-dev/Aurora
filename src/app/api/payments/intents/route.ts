/**
 * Payment Intent API Route
 * POST /api/payments/intents - Create payment intent
 * GET /api/payments/intents/[id] - Retrieve payment intent
 */

import { NextRequest, NextResponse } from 'next/server';
import paymentService from '@/lib/payments/service';
import { PaymentProvider } from '@/lib/payments/types';

export async function POST(req: NextRequest) {
  try {
    const { amount, currency, metadata, provider } = await req.json();

    if (!amount || !currency) {
      return NextResponse.json(
        { error: 'Amount and currency required' },
        { status: 400 }
      );
    }

    const intent = await paymentService.createPaymentIntent(
      amount,
      currency,
      metadata || {},
      provider as PaymentProvider
    );

    return NextResponse.json(intent);
  } catch (error: any) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const intentId = searchParams.get('id');
    const provider = searchParams.get('provider') as PaymentProvider;

    if (!intentId) {
      return NextResponse.json(
        { error: 'Intent ID required' },
        { status: 400 }
      );
    }

    const intent = await paymentService.retrievePaymentIntent(intentId, provider);

    return NextResponse.json(intent);
  } catch (error: any) {
    console.error('Payment intent retrieval error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
