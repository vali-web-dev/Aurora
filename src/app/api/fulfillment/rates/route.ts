/**
 * Shipping Rates API Route
 * POST /api/fulfillment/rates - Get shipping rate quotes
 */

import { NextRequest, NextResponse } from 'next/server';
import fulfillmentService from '@/lib/fulfillment/service';
import { Carrier } from '@/lib/fulfillment/types';

export async function POST(req: NextRequest) {
  try {
    const { origin, destination, weight, dimensions, carriers: preferredCarriers } = await req.json();

    if (!origin || !destination || !weight) {
      return NextResponse.json(
        { error: 'Origin, destination, and weight required' },
        { status: 400 }
      );
    }

    const carriersToCheck: Carrier[] = preferredCarriers || ['fedex', 'ups', 'dhl'];
    const rates: Record<string, any> = {};

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
      } catch (error: any) {
        rates[carrier] = {
          carrier,
          available: false,
          error: error.message,
        };
      }
    }

    return NextResponse.json({
      rates,
      cheapest: Object.entries(rates)
        .filter(([_, r]: any) => r.available)
        .sort((a, b) => (a[1].amount || 0) - (b[1].amount || 0))[0]?.[0] || null,
    });
  } catch (error: any) {
    console.error('Shipping rates error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
