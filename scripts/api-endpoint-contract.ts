import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

import {
  GET as analyticsEventsGet,
  POST as analyticsEventsPost,
} from '@/app/api/analytics/events/route';
import {
  GET as fulfillmentShipmentsGet,
} from '@/app/api/fulfillment/shipments/route';
import {
  GET as fulfillmentTrackingGet,
} from '@/app/api/fulfillment/tracking/route';
import {
  GET as invoiceDetailGet,
} from '@/app/api/invoices/[id]/route';
import {
  GET as invoicesGet,
} from '@/app/api/invoices/route';
import {
  GET as paymentIntentsGet,
  POST as paymentIntentsPost,
} from '@/app/api/payments/intents/route';

type EndpointCase = {
  name: string;
  invoke: () => Promise<Response>;
  expectedStatus: number;
  expectedErrorIncludes?: string;
};

type EndpointResult = {
  name: string;
  passed: boolean;
  expectedStatus: number;
  actualStatus?: number;
  message?: string;
};

type NextRequestInit = ConstructorParameters<typeof NextRequest>[1];

function makeRequest(url: string, init?: NextRequestInit): NextRequest {
  return new NextRequest(url, init);
}

async function responseJson(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  if (!text) return {};

  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
    return { value: parsed };
  } catch {
    return { raw: text };
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function getArgValue(name: string): string | null {
  const args = process.argv.slice(2);
  const direct = args.find((arg) => arg.startsWith(`${name}=`));
  if (direct) {
    return direct.slice(name.length + 1);
  }

  const index = args.indexOf(name);
  if (index >= 0 && args[index + 1] && !args[index + 1].startsWith('--')) {
    return args[index + 1];
  }

  return null;
}

async function writeReport(report: Record<string, unknown>): Promise<void> {
  const outFile =
    getArgValue('--report') ||
    path.join(process.cwd(), 'artifacts', 'api-endpoint-contracts.json');

  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Endpoint contract report: ${outFile}`);
}

const endpointCases: EndpointCase[] = [
  {
    name: 'payments/intents POST rejects invalid payload with 400',
    expectedStatus: 400,
    expectedErrorIncludes: 'Validation failed',
    invoke: () =>
      paymentIntentsPost(
        makeRequest('http://localhost:3000/api/payments/intents', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ amount: 0, currency: 'usd' }),
        })
      ),
  },
  {
    name: 'payments/intents GET requires intent id query with 400',
    expectedStatus: 400,
    expectedErrorIncludes: 'Query validation failed',
    invoke: () =>
      paymentIntentsGet(makeRequest('http://localhost:3000/api/payments/intents')),
  },
  {
    name: 'analytics/events POST requires events payload with 400',
    expectedStatus: 400,
    expectedErrorIncludes: 'Validation failed',
    invoke: () =>
      analyticsEventsPost(
        makeRequest('http://localhost:3000/api/analytics/events', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({}),
        })
      ),
  },
  {
    name: 'analytics/events GET rejects invalid days query with 400',
    expectedStatus: 400,
    expectedErrorIncludes: 'Query validation failed',
    invoke: () =>
      analyticsEventsGet(makeRequest('http://localhost:3000/api/analytics/events?days=0')),
  },
  {
    name: 'analytics/events POST accepts valid event with 200',
    expectedStatus: 200,
    invoke: () =>
      analyticsEventsPost(
        makeRequest('http://localhost:3000/api/analytics/events', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            events: {
              category: 'system',
              action: 'api_call',
              sessionId: 'contract-session',
            },
          }),
        })
      ),
  },
  {
    name: 'invoices GET requires customer id query with 400',
    expectedStatus: 400,
    expectedErrorIncludes: 'Query validation failed',
    invoke: () =>
      invoicesGet(makeRequest('http://localhost:3000/api/invoices'), {} as never),
  },
  {
    name: 'invoices/[id] GET returns 404 for unknown invoice id',
    expectedStatus: 404,
    expectedErrorIncludes: 'Invoice not found',
    invoke: () =>
      invoiceDetailGet(
        makeRequest('http://localhost:3000/api/invoices/missing-invoice'),
        { params: Promise.resolve({ id: 'missing-invoice' }) }
      ),
  },
  {
    name: 'fulfillment/shipments GET requires order id query with 400',
    expectedStatus: 400,
    expectedErrorIncludes: 'Query validation failed',
    invoke: () =>
      fulfillmentShipmentsGet(makeRequest('http://localhost:3000/api/fulfillment/shipments')),
  },
  {
    name: 'fulfillment/shipments GET accepts valid query with 200',
    expectedStatus: 200,
    invoke: () =>
      fulfillmentShipmentsGet(
        makeRequest('http://localhost:3000/api/fulfillment/shipments?orderId=order-123')
      ),
  },
  {
    name: 'fulfillment/tracking GET returns 404 for unknown tracking number in test mode',
    expectedStatus: 404,
    expectedErrorIncludes: 'Tracking number not found',
    invoke: () =>
      fulfillmentTrackingGet(
        makeRequest(
          'http://localhost:3000/api/fulfillment/tracking?trackingNumber=missing-tracking&carrier=fedex'
        )
      ),
  },
  {
    name: 'fulfillment/tracking GET returns 503 when live mode disables mock carrier',
    expectedStatus: 503,
    expectedErrorIncludes: 'Carrier unavailable in live fulfillment mode',
    invoke: async () => {
      const previousMode = process.env.FULFILLMENT_MODE;
      process.env.FULFILLMENT_MODE = 'live';

      try {
        return await fulfillmentTrackingGet(
          makeRequest(
            'http://localhost:3000/api/fulfillment/tracking?trackingNumber=any-tracking&carrier=fedex'
          )
        );
      } finally {
        if (previousMode === undefined) {
          delete process.env.FULFILLMENT_MODE;
        } else {
          process.env.FULFILLMENT_MODE = previousMode;
        }
      }
    },
  },
];

async function runEndpointContracts(): Promise<void> {
  const failures: string[] = [];
  const caseResults: EndpointResult[] = [];
  let passed = 0;

  for (const testCase of endpointCases) {
    try {
      const response = await testCase.invoke();
      const body = await responseJson(response);

      assert(
        response.status === testCase.expectedStatus,
        `${testCase.name}: expected ${testCase.expectedStatus}, got ${response.status}`
      );

      if (testCase.expectedErrorIncludes) {
        const errorText = String(body.error ?? '');
        assert(
          errorText.includes(testCase.expectedErrorIncludes),
          `${testCase.name}: expected error to include "${testCase.expectedErrorIncludes}", got "${errorText}"`
        );
      }

      passed += 1;
      caseResults.push({
        name: testCase.name,
        passed: true,
        expectedStatus: testCase.expectedStatus,
        actualStatus: response.status,
      });
      console.log(`PASS ${testCase.name}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`${testCase.name}: ${message}`);
      caseResults.push({
        name: testCase.name,
        passed: false,
        expectedStatus: testCase.expectedStatus,
        message,
      });
      console.error(`FAIL ${testCase.name}`);
      console.error(`  ${message}`);
    }
  }

  console.log(`\nEndpoint contracts: ${passed}/${endpointCases.length} passed`);

  await writeReport({
    timestamp: new Date().toISOString(),
    status: failures.length === 0 ? 'pass' : 'fail',
    summary: {
      total: endpointCases.length,
      passed,
      failed: failures.length,
    },
    results: caseResults,
  });

  if (failures.length > 0) {
    throw new Error(failures.join('\n'));
  }
}

runEndpointContracts().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('\nEndpoint contract checks failed:');
  console.error(message);
  process.exitCode = 1;
});
