/**
 * Shipments API Route
 * POST /api/fulfillment/shipments - Create a shipment
 * GET /api/fulfillment/shipments - List shipments for an order
 */

import { NextRequest } from 'next/server';
import fulfillmentService from '@/lib/fulfillment/service';
import { Carrier } from '@/lib/fulfillment/types';
import {
  errorResponse,
  successResponse,
  validateQuery,
  validateRequestBody,
} from '@/lib/request-validation';
import {
  fulfillmentShipmentsQuerySchema,
  fulfillmentShipmentCreateSchema,
} from '@/lib/validations';
import type { z } from 'zod';

type ShipmentCreatePayload = z.infer<typeof fulfillmentShipmentCreateSchema>;
type ShipmentQueryPayload = z.infer<typeof fulfillmentShipmentsQuerySchema>;

interface StoredShipment {
  orderId: string;
  trackingNumber: string;
  carrier: Carrier;
  createdAt: Date;
  shipmentAddress: ShipmentCreatePayload['shipmentAddress'];
}

// In-memory store for shipments (should be in database)
const shipmentsDb: Record<string, StoredShipment> = {};

export async function POST(req: NextRequest) {
  try {
    const validation = await validateRequestBody(req, fulfillmentShipmentCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const {
      orderId,
      carrier,
      recipientName,
      recipientEmail,
      shipmentAddress,
      packages,
      shippingMethod,
    } = validation.data as ShipmentCreatePayload;

    const carrierInstance = fulfillmentService.getCarrier(carrier);
    const label = await carrierInstance.createShipment({
      orderId,
      carrier,
      recipientName,
      recipientEmail: recipientEmail || '',
      shipmentAddress,
      packages,
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

    return successResponse({
      success: true,
      ...label,
    });
  } catch (error: unknown) {
    console.error('Shipment creation error:', error);
    const message = error instanceof Error ? error.message : '';
    if (message.includes('not found')) {
      return errorResponse('Carrier not found', 404);
    }
    if (message.includes('mock adapter cannot execute')) {
      return errorResponse('Carrier unavailable in live fulfillment mode', 503);
    }
    return errorResponse('Failed to create shipment', 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryValidation = validateQuery<ShipmentQueryPayload>(
      searchParams,
      fulfillmentShipmentsQuerySchema
    );

    if (!queryValidation.success) {
      return errorResponse(queryValidation.error, 400);
    }
    const { orderId } = queryValidation.data;

    const shipments = Object.values(shipmentsDb).filter((s) => s.orderId === orderId);

    return successResponse({ shipments });
  } catch (error: unknown) {
    console.error('List shipments error:', error);
    return errorResponse('Failed to list shipments', 500);
  }
}
