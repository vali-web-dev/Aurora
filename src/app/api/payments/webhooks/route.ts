/**
 * Payment Webhooks API Route
 * POST /api/payments/webhooks - Handle webhook events from payment providers
 */

import { NextRequest, NextResponse } from 'next/server';
import paymentService from '@/lib/payments/service';
import { PaymentProvider } from '@/lib/payments/types';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import * as schema from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { withApiTrace } from '@/lib/api-trace';
import { getArtifactStorage } from '@/lib/artifacts/storage';

interface WebhookProcessingContext {
  eventId: string;
  type: string;
  provider: PaymentProvider;
  timestamp: Date;
  handled: boolean;
}

const webhookLog: WebhookProcessingContext[] = [];
const webhookLogMaxEntries = 100;
const webhookStorage = getArtifactStorage();
const webhookLogKey = process.env.WEBHOOK_LOG_KEY || 'artifacts/payment-webhooks.json';

type OrderRecord = typeof schema.orders.$inferSelect;

function getAdminAllowlist(): string[] {
  const multi = (process.env.AURORA_ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const single = [process.env.AURORA_ADMIN_EMAIL, process.env.ADMIN_EMAIL]
    .map((value) => (value || '').trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set([...multi, ...single]));
}

function parseProvider(input: string | null): PaymentProvider | null {
  const candidate = (input || 'stripe').trim().toLowerCase();
  if (candidate === 'stripe' || candidate === 'adyen') {
    return candidate;
  }
  return null;
}

async function readWebhookLogFile(limit: number): Promise<{ events: WebhookProcessingContext[]; total: number }> {
  try {
    const raw = await webhookStorage.readText(webhookLogKey);
    const parsed = JSON.parse(raw) as Array<
      Omit<WebhookProcessingContext, 'timestamp'> & { timestamp: string }
    >;
    const allEvents = parsed.map((entry) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    }));
    const events = allEvents.slice(-Math.max(limit, 1));

    return {
      events,
      total: allEvents.length,
    };
  } catch {
    return { events: [], total: 0 };
  }
}

async function saveWebhookLogFile(events: WebhookProcessingContext[]): Promise<void> {
  const payload = events.map((event) => ({
    ...event,
    timestamp: event.timestamp.toISOString(),
  }));
  await webhookStorage.writeText(webhookLogKey, JSON.stringify(payload, null, 2));
}

async function logWebhookEvent(context: WebhookProcessingContext): Promise<void> {
  webhookLog.push(context);
  if (webhookLog.length > webhookLogMaxEntries) {
    webhookLog.shift();
  }

  try {
    const existing = await readWebhookLogFile(webhookLogMaxEntries);
    const merged = [...existing.events, context].slice(-webhookLogMaxEntries);
    await saveWebhookLogFile(merged);
  } catch (error) {
    console.error('Failed to persist webhook event log:', error);
  }
}

async function handlePaymentIntentSucceeded(data: any, provider: PaymentProvider): Promise<void> {
  const resolved = await resolveOrderFromWebhookData(data, provider);
  const intentId = extractIntentId(data, provider);
  const amountCents = extractAmountCents(data, provider);
  const currency = extractCurrency(data, provider);

  if (!resolved) {
    console.warn(`[Webhook] Could not resolve order for successful payment (${provider})`, {
      intentId,
    });
    return;
  }

  await db
    .update(schema.orders)
    .set({
      status: 'paid',
      providerPayload: {
        ...(resolved.providerPayload || {}),
        provider,
        intentId,
        lastWebhookType: 'payment_intent.succeeded',
        paidAt: new Date().toISOString(),
      },
    })
    .where(eq(schema.orders.id, resolved.id));

  await db.insert(schema.payments).values({
    orderId: resolved.id,
    method: provider,
    amountCents: amountCents ?? resolved.totalCents ?? 0,
    currency: currency ?? resolved.currency ?? 'USD',
    status: 'succeeded',
    metadata: {
      provider,
      intentId,
      eventType: 'payment_intent.succeeded',
      raw: data,
    },
  });

  await db.insert(schema.notifications).values({
    userId: resolved.userId,
    kind: 'payment_success',
    title: 'Payment confirmed',
    body: `Order ${resolved.id} has been paid successfully.`,
    payload: {
      orderId: resolved.id,
      provider,
      intentId,
    },
    read: false,
  });

  console.log(`[Webhook] Payment succeeded for order ${resolved.id} (${provider})`);
}

async function handlePaymentFailed(data: any, provider: PaymentProvider): Promise<void> {
  const resolved = await resolveOrderFromWebhookData(data, provider);
  const intentId = extractIntentId(data, provider);

  if (!resolved) {
    console.warn(`[Webhook] Could not resolve order for failed payment (${provider})`, {
      intentId,
    });
    return;
  }

  await db
    .update(schema.orders)
    .set({
      status: 'payment_failed',
      providerPayload: {
        ...(resolved.providerPayload || {}),
        provider,
        intentId,
        lastWebhookType: 'payment_intent.payment_failed',
        failedAt: new Date().toISOString(),
      },
    })
    .where(eq(schema.orders.id, resolved.id));

  await db.insert(schema.payments).values({
    orderId: resolved.id,
    method: provider,
    amountCents: extractAmountCents(data, provider) ?? resolved.totalCents ?? 0,
    currency: extractCurrency(data, provider) ?? resolved.currency ?? 'USD',
    status: 'failed',
    metadata: {
      provider,
      intentId,
      eventType: 'payment_intent.payment_failed',
      raw: data,
    },
  });

  await db.insert(schema.notifications).values({
    userId: resolved.userId,
    kind: 'payment_failed',
    title: 'Payment failed',
    body: `Payment for order ${resolved.id} failed. Please retry checkout.`,
    payload: {
      orderId: resolved.id,
      provider,
      intentId,
    },
    read: false,
  });

  console.log(`[Webhook] Payment failed for order ${resolved.id} (${provider})`);
}

async function handleRefundCreated(data: any, provider: PaymentProvider): Promise<void> {
  const resolved = await resolveOrderFromWebhookData(data, provider);
  const intentId = extractIntentId(data, provider);

  if (!resolved) {
    console.warn(`[Webhook] Could not resolve order for refund (${provider})`, {
      intentId,
    });
    return;
  }

  await db
    .update(schema.orders)
    .set({
      status: 'refunded',
      providerPayload: {
        ...(resolved.providerPayload || {}),
        provider,
        intentId,
        lastWebhookType: 'charge.refunded',
        refundedAt: new Date().toISOString(),
      },
    })
    .where(eq(schema.orders.id, resolved.id));

  await db.insert(schema.payments).values({
    orderId: resolved.id,
    method: provider,
    amountCents: extractAmountCents(data, provider) ?? resolved.totalCents ?? 0,
    currency: extractCurrency(data, provider) ?? resolved.currency ?? 'USD',
    status: 'refunded',
    metadata: {
      provider,
      intentId,
      eventType: 'charge.refunded',
      raw: data,
    },
  });

  await db.insert(schema.notifications).values({
    userId: resolved.userId,
    kind: 'refund_created',
    title: 'Refund processed',
    body: `Refund for order ${resolved.id} has been initiated.`,
    payload: {
      orderId: resolved.id,
      provider,
      intentId,
    },
    read: false,
  });

  console.log(`[Webhook] Refund created for order ${resolved.id} (${provider})`);
}

function extractMetadata(data: any, provider: PaymentProvider): Record<string, any> {
  if (provider === 'stripe') {
    return (data?.metadata || {}) as Record<string, any>;
  }

  const item = data?.notificationItems?.[0]?.NotificationRequestItem;
  return (item?.additionalData || item?.metadata || data?.metadata || {}) as Record<string, any>;
}

function extractIntentId(data: any, provider: PaymentProvider): string | null {
  if (provider === 'stripe') {
    return data?.id || data?.payment_intent || null;
  }

  const item = data?.notificationItems?.[0]?.NotificationRequestItem;
  return item?.pspReference || item?.merchantReference || data?.id || null;
}

function extractAmountCents(data: any, provider: PaymentProvider): number | null {
  if (provider === 'stripe') {
    return typeof data?.amount_received === 'number'
      ? data.amount_received
      : typeof data?.amount === 'number'
      ? data.amount
      : null;
  }

  const value = data?.notificationItems?.[0]?.NotificationRequestItem?.amount?.value;
  return typeof value === 'number' ? value : null;
}

function extractCurrency(data: any, provider: PaymentProvider): string | null {
  if (provider === 'stripe') {
    const currency = data?.currency;
    return typeof currency === 'string' ? currency.toUpperCase() : null;
  }

  const currency = data?.notificationItems?.[0]?.NotificationRequestItem?.amount?.currency;
  return typeof currency === 'string' ? currency.toUpperCase() : null;
}

async function resolveOrderFromWebhookData(data: any, provider: PaymentProvider): Promise<OrderRecord | null> {
  const metadata = extractMetadata(data, provider);
  const metadataOrderId = metadata?.orderId;

  if (typeof metadataOrderId === 'number' && Number.isInteger(metadataOrderId)) {
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, metadataOrderId))
      .limit(1);
    if (order) return order;
  }

  if (typeof metadataOrderId === 'string') {
    const maybeInt = Number.parseInt(metadataOrderId, 10);
    if (Number.isInteger(maybeInt)) {
      const [order] = await db
        .select()
        .from(schema.orders)
        .where(eq(schema.orders.id, maybeInt))
        .limit(1);
      if (order) return order;
    }
  }

  const intentId = extractIntentId(data, provider);
  if (!intentId) return null;

  // Fallback for older payloads: scan existing order provider payload references.
  const orders = await db.select().from(schema.orders);
  const byIntent = orders.find((order) => {
    const payload = (order.providerPayload || {}) as Record<string, any>;
    return payload.intentId === intentId || payload.paymentIntentId === intentId;
  });

  return byIntent || null;
}

const postWebhookHandler = async (req: NextRequest) => {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') ||
                      req.headers.get('x-adyen-notification-auth') ||
                      '';
    const provider = parseProvider(new URL(req.url).searchParams.get('provider'));
    if (!provider) {
      return NextResponse.json(
        { error: 'Unsupported payment provider' },
        { status: 400 }
      );
    }

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
  } catch (error: unknown) {
    console.error('Webhook processing error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process webhook';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
};

export const POST = withApiTrace('/api/payments/webhooks', async (req, _context) =>
  postWebhookHandler(req)
);

const getWebhookHandler = async (req: NextRequest) => {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase() || '';
  const allowlist = getAdminAllowlist();

  if (!session?.user?.id || !email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!allowlist.includes(email)) {
    return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
  }

  // Debug endpoint to view recent webhooks
  const limit = parseInt(new URL(req.url).searchParams.get('limit') || '10');
  const persisted = await readWebhookLogFile(limit);
  const sourceEvents = persisted.events.length > 0 ? persisted.events : webhookLog.slice(-limit);

  return NextResponse.json({
    webhooks: sourceEvents,
    total: persisted.total > 0 ? persisted.total : webhookLog.length,
  });
};

export const GET = withApiTrace('/api/payments/webhooks', async (req, _context) =>
  getWebhookHandler(req)
);
