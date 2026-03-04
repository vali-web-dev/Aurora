/**
 * DHL Carrier Implementation (Mock)
 * In production, integrate with DHL Express API
 */

import { ICarrier, Carrier, Shipment, ShipmentCreationRequest, CarrierLabel, TrackingEvent } from './types';

const mockTrackingHistory: Record<string, Shipment> = {};

function generateTrackingNumber(): string {
  return `${Math.random().toString().slice(2, 12)}`;
}

function simulateTrackingEvents(orderedAt: Date): TrackingEvent[] {
  const now = new Date();
  const hoursElapsed = (now.getTime() - orderedAt.getTime()) / (1000 * 60 * 60);
  
  const events: TrackingEvent[] = [];
  
  events.push({
    timestamp: orderedAt,
    status: 'created',
    location: { city: 'Cincinnati', state: 'OH', country: 'US', zip: '45226' },
    description: 'Shipment picked up',
    eventCode: 'PU',
  });

  if (hoursElapsed >= 6) {
    events.push({
      timestamp: new Date(orderedAt.getTime() + 6 * 60 * 60 * 1000),
      status: 'in_transit',
      location: { city: 'Cincinnati', state: 'OH', country: 'US', zip: '45226' },
      description: 'In transit',
      eventCode: 'IT',
    });
  }

  if (hoursElapsed >= 18) {
    events.push({
      timestamp: new Date(orderedAt.getTime() + 18 * 60 * 60 * 1000),
      status: 'in_transit',
      location: { state: 'destination state', country: 'US' },
      description: 'Customs cleared',
      eventCode: 'CC',
    });
  }

  if (hoursElapsed >= 30) {
    events.push({
      timestamp: new Date(orderedAt.getTime() + 30 * 60 * 60 * 1000),
      status: 'out_for_delivery',
      location: { state: 'destination state', country: 'US' },
      description: 'Out for delivery',
      eventCode: 'OD',
    });
  }

  if (hoursElapsed >= 40) {
    events.push({
      timestamp: new Date(orderedAt.getTime() + 40 * 60 * 60 * 1000),
      status: 'delivered',
      location: { state: 'destination state', country: 'US' },
      description: 'Delivered',
      eventCode: 'DL',
    });
  }

  return events;
}

export class DHLCarrier implements ICarrier {
  name: Carrier = 'dhl';
  private apiKey = process.env.DHL_API_KEY || 'mock-key';

  async createShipment(request: ShipmentCreationRequest): Promise<CarrierLabel> {
    const trackingNumber = generateTrackingNumber();
    
    const shipment: Shipment = {
      id: `sg_${Date.now()}`,
      orderId: request.orderId,
      carrier: 'dhl',
      trackingNumber,
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days
      status: 'created',
      events: [
        {
          timestamp: new Date(),
          status: 'created',
          location: { city: 'Cincinnati', state: 'OH', country: 'US', zip: '45226' },
          description: 'Shipment picked up',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockTrackingHistory[trackingNumber] = shipment;

    return {
      trackingNumber,
      labelUrl: `https://www.dhl.com/shipmenttracking?AWB=${trackingNumber}.pdf`,
      carrier: 'dhl',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
  }

  async getTracking(trackingNumber: string): Promise<Shipment> {
    if (mockTrackingHistory[trackingNumber]) {
      const shipment = mockTrackingHistory[trackingNumber];
      return {
        ...shipment,
        events: simulateTrackingEvents(shipment.createdAt),
        status: simulateTrackingEvents(shipment.createdAt)[
          simulateTrackingEvents(shipment.createdAt).length - 1
        ].status,
      };
    }

    throw new Error(`Tracking number ${trackingNumber} not found`);
  }

  async cancelShipment(trackingNumber: string): Promise<void> {
    if (mockTrackingHistory[trackingNumber]) {
      delete mockTrackingHistory[trackingNumber];
    }
  }

  async getRate(
    origin: { zip: string; country: string },
    dest: { zip: string; country: string; state: string },
    weight: number
  ): Promise<{ amount: number; estimatedDays: number }> {
    const baseRate = 14.99;
    const weightFactor = weight * 0.55;
    const totalAmount = Math.round((baseRate + weightFactor) * 100);

    return {
      amount: totalAmount,
      estimatedDays: 4,
    };
  }

  async initiateReturn(trackingNumber: string): Promise<{ returnTrackingNumber: string; labelUrl: string }> {
    return {
      returnTrackingNumber: generateTrackingNumber(),
      labelUrl: `https://www.dhl.com/shipmenttracking?returnAWB=${trackingNumber}.pdf`,
    };
  }

  async verifyDelivery(trackingNumber: string): Promise<boolean> {
    const shipment = await this.getTracking(trackingNumber);
    return shipment.status === 'delivered';
  }
}
