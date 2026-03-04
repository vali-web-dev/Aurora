/**
 * Tracking API Route
 * GET /api/fulfillment/tracking - Get tracking information for a shipment
 */

import { NextRequest, NextResponse } from 'next/server';
import fulfillmentService from '@/lib/fulfillment/service';
import { Carrier } from '@/lib/fulfillment/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const trackingNumber = searchParams.get('trackingNumber');
    const carrier = searchParams.get('carrier') as Carrier;

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Tracking number required' },
        { status: 400 }
      );
    }

    try {
      const shipment = await fulfillmentService.getTracking(trackingNumber, carrier);

      return NextResponse.json({
        shipment,
        lastEvent: shipment.events[shipment.events.length - 1] || null,
        status: shipment.status,
        isDelivered: shipment.status === 'delivered',
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Tracking number not found' },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Tracking error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
