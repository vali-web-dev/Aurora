import { Carrier } from './types';

export type FulfillmentMode = 'test' | 'live';

export function getFulfillmentMode(): FulfillmentMode {
  const mode = (process.env.FULFILLMENT_MODE || 'test').trim().toLowerCase();
  return mode === 'live' ? 'live' : 'test';
}

export function assertMockModeAllowed(carrier: Carrier, operation: string): void {
  const mode = getFulfillmentMode();
  if (mode === 'live') {
    throw new Error(
      `[Fulfillment] ${carrier} mock adapter cannot execute '${operation}' in FULFILLMENT_MODE=live. Integrate a real carrier API adapter or set FULFILLMENT_MODE=test.`
    );
  }
}
