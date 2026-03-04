/**
 * Payment Methods API Route
 * GET /api/payments/methods - List payment methods
 * POST /api/payments/methods - Save a payment method
 * DELETE /api/payments/methods/[id] - Delete a payment method
 */

import { NextRequest, NextResponse } from 'next/server';
import paymentService from '@/lib/payments/service';
import { PaymentProvider } from '@/lib/payments/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const provider = searchParams.get('provider') as PaymentProvider;

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID required' },
        { status: 400 }
      );
    }

    const methods = await paymentService.listPaymentMethods(customerId, provider);

    return NextResponse.json({ methods });
  } catch (error: any) {
    console.error('List payment methods error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { customerId, paymentMethodData, provider } = await req.json();

    if (!customerId || !paymentMethodData) {
      return NextResponse.json(
        { error: 'Customer ID and payment method data required' },
        { status: 400 }
      );
    }

    const method = await paymentService.savePaymentMethod(
      customerId,
      paymentMethodData,
      provider as PaymentProvider
    );

    return NextResponse.json({ method });
  } catch (error: any) {
    console.error('Save payment method error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentMethodId = searchParams.get('id');
    const provider = searchParams.get('provider') as PaymentProvider;

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID required' },
        { status: 400 }
      );
    }

    await paymentService.deletePaymentMethod(paymentMethodId, provider);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete payment method error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
