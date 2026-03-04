/**
 * Shipments API Route
 * POST /api/fulfillment/shipments - Create a shipment
 * GET /api/fulfillment/shipments - List shipments for an order
 */

import { NextRequest, NextResponse } from 'next/server';
import fulfillmentService from '@/lib/fulfillment/service';
import { Carrier } from '@/lib/fulfillment/types';

// In-memory store for shipments (should be in database)
const shipmentsDb: Record<string, any> = {};

export async function POST(req: NextRequest) {
  try {
    const { orderId, carrier, recipientName, recipientEmail, shipmentAddress, packages, shippingMethod } = await req.json();

    if (!orderId || !carrier || !shipmentAddress) {
      return NextResponse.json(
        { error: 'Order ID, carrier, and shipment address required' },
        { status: 400 }
      );
    }

    const carrierInstance = fulfillmentService.getCarrier(carrier as Carrier);
    const label = await carrierInstance.createShipment({
      orderId,
      carrier: carrier as Carrier,
      recipientName: recipientName || 'Recipient',
      recipientEmail: recipientEmail || '',
      shipmentAddress,
      packages: packages || [{ weight: 1, length: 10, width: 10, height: 10, value: 0 }],
      shippingMethod,
    });

    // Store shipment metadata
    const shipmentKey = `${orderId}-${label.trackingNumber}`;
    shipmentsDb[shipmentKey] = {
      orderId,
      trackingNumber: label.trackingNumber,
      carrier,
      createdAt: new Date(),
      shipmentAddress,
    };

    return NextResponse.json({
      success: true,
      ...label,
    });
  } catch (error: any) {
    console.error('Shipment creation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID required' },
        { status: 400 }
      );
    }

    const shipments = Object.values(shipmentsDb).filter(
      (s: any) => s.orderId === orderId
    );

    return NextResponse.json({ shipments });
  } catch (error: any) {
    console.error('List shipments error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
