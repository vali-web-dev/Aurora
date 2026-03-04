/**
 * Payment Webhooks API Route
 * POST /api/payments/webhooks - Handle webhook events from payment providers
 */

import { NextRequest, NextResponse } from 'next/server';
import paymentService from '@/lib/payments/service';
import { PaymentProvider } from '@/lib/payments/types';

interface WebhookProcessingContext {
  eventId: string;
  type: string;
  provider: PaymentProvider;
  timestamp: Date;
  handled: boolean;
}

const webhookLog: WebhookProcessingContext[] = [];

// TODO: Move to database in production
async function logWebhookEvent(context: WebhookProcessingContext): Promise<void> {
  webhookLog.push(context);
  // Keep only last 100 webhooks
  if (webhookLog.length > 100) {
    webhookLog.shift();
  }
}

async function handlePaymentIntentSucceeded(data: any, provider: PaymentProvider): Promise<void> {
  // TODO: Find order by payment intent ID
  // TODO: Update order status to 'paid'
  // TODO: Trigger fulfillment workflow
  // TODO: Send confirmation email
  console.log(`Payment succeeded for ${provider}:`, data);
}

async function handlePaymentFailed(data: any, provider: PaymentProvider): Promise<void> {
  // TODO: Find order by payment intent ID
  // TODO: Update order status to 'payment_failed'
  // TODO: Send failure notification
  console.log(`Payment failed for ${provider}:`, data);
}

async function handleRefundCreated(data: any, provider: PaymentProvider): Promise<void> {
  // TODO: Find order by charge ID
  // TODO: Update order refund status
  // TODO: Send refund confirmation
  console.log(`Refund created for ${provider}:`, data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') ||
                      req.headers.get('x-adyen-notification-auth') ||
                      '';
    const provider = (new URL(req.url).searchParams.get('provider') || 'stripe') as PaymentProvider;

    // Verify webhook signature and parse event
    const event = await paymentService.handleWebhook(
      body,
      signature,
      provider
    );

    if (!event.verified) {
      console.warn('Webhook signature verification failed:', event.id);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 403 }
      );
    }

    // Route event handling
    let handled = false;

    switch (provider) {
      case 'stripe':
        switch (event.type) {
          case 'payment_intent.succeeded':
            await handlePaymentIntentSucceeded(event.data.object, provider);
            handled = true;
            break;
          case 'payment_intent.payment_failed':
            await handlePaymentFailed(event.data.object, provider);
            handled = true;
            break;
          case 'charge.refunded':
            await handleRefundCreated(event.data.object, provider);
            handled = true;
            break;
        }
        break;

      case 'adyen':
        switch (event.type) {
          case 'AUTHORISATION':
          case 'CAPTURE':
            await handlePaymentIntentSucceeded(event.data, provider);
            handled = true;
            break;
          case 'REFUSED':
          case 'EXPIRED':
            await handlePaymentFailed(event.data, provider);
            handled = true;
            break;
          case 'REFUND':
            await handleRefundCreated(event.data, provider);
            handled = true;
            break;
        }
        break;
    }

    // Log webhook processing
    await logWebhookEvent({
      eventId: event.id,
      type: event.type,
      provider,
      timestamp: event.timestamp,
      handled,
    });

    // Return 200 to acknowledge receipt
    return NextResponse.json({
      success: true,
      eventId: event.id,
      handled,
    });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Debug endpoint to view recent webhooks
  const limit = parseInt(new URL(req.url).searchParams.get('limit') || '10');
  return NextResponse.json({
    webhooks: webhookLog.slice(-limit),
    total: webhookLog.length,
  });
}
