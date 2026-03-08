import {
  analyticsEventsPostSchema,
  analyticsEventsQuerySchema,
  analyticsMetricsQuerySchema,
  fulfillmentRatesRequestSchema,
  fulfillmentReturnSchema,
  fulfillmentShipmentCreateSchema,
  fulfillmentTrackingQuerySchema,
  invoiceCreateSchema,
  invoicesListQuerySchema,
  paymentConfirmSchema,
  paymentIntentCreateSchema,
  paymentIntentRetrieveQuerySchema,
  paymentMethodDeleteQuerySchema,
  paymentMethodSaveSchema,
  paymentMethodsListQuerySchema,
  paymentRefundSchema,
} from '../src/lib/validations';

type AssertionCase = {
  name: string;
  passed: boolean;
  details?: string;
};

const results: AssertionCase[] = [];

function assertCase(name: string, passed: boolean, details?: string) {
  results.push({ name, passed, details });
}

function expectValid(name: string, parseResult: { success: boolean; error?: { message: string } }) {
  assertCase(name, parseResult.success, parseResult.success ? undefined : parseResult.error?.message);
}

function expectInvalid(name: string, parseResult: { success: boolean }) {
  assertCase(name, !parseResult.success, parseResult.success ? 'Expected parse failure but succeeded' : undefined);
}

// Payments
expectValid(
  'paymentIntentCreateSchema accepts valid payload',
  paymentIntentCreateSchema.safeParse({ amount: 1999, currency: 'usd', provider: 'stripe', metadata: { orderId: 'ord_1' } })
);
expectInvalid(
  'paymentIntentCreateSchema rejects invalid provider',
  paymentIntentCreateSchema.safeParse({ amount: 1999, currency: 'USD', provider: 'paypal' })
);
expectValid(
  'paymentIntentRetrieveQuerySchema accepts valid query',
  paymentIntentRetrieveQuerySchema.safeParse({ id: 'pi_123', provider: 'adyen' })
);
expectValid(
  'paymentMethodsListQuerySchema accepts valid query',
  paymentMethodsListQuerySchema.safeParse({ customerId: 'cus_123', provider: 'stripe' })
);
expectValid(
  'paymentMethodSaveSchema accepts valid payload',
  paymentMethodSaveSchema.safeParse({ customerId: 'cus_123', paymentMethodData: { token: 'pm_1' }, provider: 'stripe' })
);
expectValid(
  'paymentMethodDeleteQuerySchema accepts valid query',
  paymentMethodDeleteQuerySchema.safeParse({ id: 'pm_1', provider: 'stripe' })
);
expectValid(
  'paymentConfirmSchema accepts valid payload',
  paymentConfirmSchema.safeParse({ intentId: 'pi_1', paymentMethodId: 'pm_1', provider: 'adyen' })
);
expectInvalid(
  'paymentRefundSchema rejects negative amount',
  paymentRefundSchema.safeParse({ chargeId: 'ch_1', amount: -5, reason: 'other', provider: 'stripe' })
);

// Analytics
expectValid(
  'analyticsEventsPostSchema accepts single event',
  analyticsEventsPostSchema.safeParse({
    events: {
      category: 'commerce',
      action: 'view_product',
      userId: 'u1',
      metadata: { source: 'ui' },
    },
  })
);
expectValid(
  'analyticsEventsPostSchema accepts batch',
  analyticsEventsPostSchema.safeParse({
    batch: [
      {
        category: 'payment',
        action: 'create_payment_intent',
        value: 1099,
        metadata: {},
      },
    ],
  })
);
expectInvalid(
  'analyticsEventsPostSchema rejects empty payload',
  analyticsEventsPostSchema.safeParse({})
);
expectValid(
  'analyticsEventsQuerySchema applies defaults',
  analyticsEventsQuerySchema.safeParse({})
);
expectInvalid(
  'analyticsMetricsQuerySchema rejects unknown category',
  analyticsMetricsQuerySchema.safeParse({ category: 'unknown' })
);

// Invoices
expectValid(
  'invoiceCreateSchema accepts valid payload',
  invoiceCreateSchema.safeParse({
    orderId: 'ord_123',
    orderData: {
      customerEmail: 'customer@example.com',
      lineItems: [{ id: 'li_1', qty: 1 }],
    },
  })
);
expectInvalid(
  'invoiceCreateSchema rejects invalid email',
  invoiceCreateSchema.safeParse({
    orderId: 'ord_123',
    orderData: {
      customerEmail: 'not-an-email',
    },
  })
);
expectValid(
  'invoicesListQuerySchema accepts valid query',
  invoicesListQuerySchema.safeParse({ customerId: 'cus_42' })
);

// Fulfillment
expectValid(
  'fulfillmentShipmentCreateSchema accepts valid payload',
  fulfillmentShipmentCreateSchema.safeParse({
    orderId: 'ord_999',
    carrier: 'fedex',
    recipientName: 'Aurora User',
    recipientEmail: 'user@example.com',
    shipmentAddress: {
      street: '1 Aurora Way',
      city: 'Toronto',
      state: 'ON',
      zip: 'M5H2N2',
      country: 'CA',
    },
    packages: [{ weight: 2.5, length: 20, width: 15, height: 10, value: 2499 }],
    shippingMethod: 'express',
  })
);
expectInvalid(
  'fulfillmentShipmentCreateSchema rejects empty packages',
  fulfillmentShipmentCreateSchema.safeParse({
    orderId: 'ord_999',
    carrier: 'ups',
    recipientName: 'Aurora User',
    shipmentAddress: {
      street: '1 Aurora Way',
      city: 'Toronto',
      state: 'ON',
      zip: 'M5H2N2',
      country: 'CA',
    },
    packages: [],
  })
);
expectValid(
  'fulfillmentRatesRequestSchema accepts valid payload',
  fulfillmentRatesRequestSchema.safeParse({
    origin: { zip: '10001', country: 'US' },
    destination: { zip: '94105', country: 'US', state: 'CA' },
    weight: 4,
    carriers: ['fedex', 'dhl'],
  })
);
expectValid(
  'fulfillmentReturnSchema accepts valid payload',
  fulfillmentReturnSchema.safeParse({ trackingNumber: '1Z999AA', carrier: 'ups', reason: 'Damaged item' })
);
expectValid(
  'fulfillmentTrackingQuerySchema accepts valid query',
  fulfillmentTrackingQuerySchema.safeParse({ trackingNumber: '1Z999AA', carrier: 'ups' })
);

const passed = results.filter((r) => r.passed);
const failed = results.filter((r) => !r.passed);

for (const result of results) {
  const marker = result.passed ? 'PASS' : 'FAIL';
  const detail = result.details ? ` :: ${result.details}` : '';
  console.log(`[${marker}] ${result.name}${detail}`);
}

console.log(`\nSummary: ${passed.length}/${results.length} checks passed`);

if (failed.length > 0) {
  process.exitCode = 1;
}
