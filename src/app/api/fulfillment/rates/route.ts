/**
 * Shipping Rates API Route
 * POST /api/fulfillment/rates - Get shipping rate quotes
 */

import { NextRequest } from 'next/server';
import fulfillmentService from '@/lib/fulfillment/service';
import { Carrier } from '@/lib/fulfillment/types';
import { errorResponse, successResponse, validateRequestBody } from '@/lib/request-validation';
import { fulfillmentRatesRequestSchema } from '@/lib/validations';
import type { z } from 'zod';

type RatesRequestPayload = z.infer<typeof fulfillmentRatesRequestSchema>;

interface AvailableRate {
  carrier: Carrier;
  amount: number;
  amountFormatted: string;
  estimatedDays: number;
  estimated: string;
  available: true;
}

interface UnavailableRate {
  carrier: Carrier;
  available: false;
  error: string;
}

type RateEntry = AvailableRate | UnavailableRate;

export async function POST(req: NextRequest) {
  try {
    const validation = await validateRequestBody(req, fulfillmentRatesRequestSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { origin, destination, weight, dimensions, carriers: preferredCarriers } =
      validation.data as RatesRequestPayload;

    const carriersToCheck: Carrier[] = preferredCarriers || ['fedex', 'ups', 'dhl'];
    const rates: Record<Carrier, RateEntry> = {} as Record<Carrier, RateEntry>;

    for (const carrier of carriersToCheck) {
      try {
        const rate = await fulfillmentService.getRate(
          origin,
          destination,
          weight,
          dimensions?.length,
          dimensions?.width,
          dimensions?.height,
          carrier
        );

        rates[carrier] = {
          carrier,
          amount: rate.amount,
          amountFormatted: `$${(rate.amount / 100).toFixed(2)}`,
          estimatedDays: rate.estimatedDays,
          estimated: `${rate.estimatedDays} business days`,
          available: true,
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Carrier unavailable';
        rates[carrier] = {
          carrier,
          available: false,
          error: message,
        };
      }
    }

    const cheapest = Object.values(rates)
      .filter((rate): rate is AvailableRate => rate.available)
      .sort((a, b) => a.amount - b.amount)[0]?.carrier || null;

    return successResponse({
      rates,
      cheapest,
    });
  } catch (error: unknown) {
    console.error('Shipping rates error:', error);
    const message = error instanceof Error ? error.message : '';
    if (message.includes('mock adapter cannot execute')) {
      return errorResponse('Carrier unavailable in live fulfillment mode', 503);
    }
    return errorResponse('Failed to fetch shipping rates', 500);
  }
}
