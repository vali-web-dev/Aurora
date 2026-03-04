/**
 * UPS Carrier Implementation (Mock)
 * In production, integrate with UPS API
 */

import { ICarrier, Carrier, Shipment, ShipmentCreationRequest, CarrierLabel, ShipmentStatus, TrackingEvent } from './types';

const mockTrackingHistory: Record<string, Shipment> = {};

function generateTrackingNumber(): string {
  return `1Z${Math.random().toString().slice(2, 14)}`;
}

function simulateTrackingEvents(orderedAt: Date): TrackingEvent[] {
  const now = new Date();
  const hoursElapsed = (now.getTime() - orderedAt.getTime()) / (1000 * 60 * 60);
  
  const events: TrackingEvent[] = [];
  
  events.push({
    timestamp: orderedAt,
    status: 'created',
    location: { city: 'Louisville', state: 'KY', country: 'US', zip: '40223' },
    description: 'Order processed',
    eventCode: 'OR',
  });

  if (hoursElapsed >= 2) {
    events.push({
      timestamp: new Date(orderedAt.getTime() + 2 * 60 * 60 * 1000),
      status: 'picked_up',
      location: { city: 'Louisville', state: 'KY', country: 'US', zip: '40223' },
      description: 'Pick-up scan',
      eventCode: 'PU',
    });
  }

  if (hoursElapsed >= 8) {
    events.push({
      timestamp: new Date(orderedAt.getTime() + 8 * 60 * 60 * 1000),
      status: 'in_transit',
      location: { city: 'Chicago', state: 'IL', country: 'US', zip: '60666' },
      description: 'Arrived at UPS facility',
      eventCode: 'AR',
    });
  }

  if (hoursElapsed >= 24) {
    events.push({
      timestamp: new Date(orderedAt.getTime() + 24 * 60 * 60 * 1000),
      status: 'in_transit',
      location: { state: 'destination state', country: 'US' },
      description: 'On the way',
      eventCode: 'DP',
    });
  }

  if (hoursElapsed >= 42) {
    events.push({
      timestamp: new Date(orderedAt.getTime() + 42 * 60 * 60 * 1000),
      status: 'out_for_delivery',
      location: { state: 'destination state', country: 'US' },
      description: 'Out for delivery',
      eventCode: 'OD',
    });
  }

  if (hoursElapsed >= 48) {
    events.push({
      timestamp: new Date(orderedAt.getTime() + 48 * 60 * 60 * 1000),
      status: 'delivered',
      location: { state: 'destination state', country: 'US' },
      description: 'Delivered',
      eventCode: 'DL',
    });
  }

  return events;
}

export class UPSCarrier implements ICarrier {
  name: Carrier = 'ups';
  private apiKey = process.env.UPS_API_KEY || 'mock-key';
  private accountNum = process.env.UPS_ACCOUNT_NUM || '123456789';

  async createShipment(request: ShipmentCreationRequest): Promise<CarrierLabel> {
    const trackingNumber = generateTrackingNumber();
    
    const shipment: Shipment = {
      id: `sg_${Date.now()}`,
      orderId: request.orderId,
      carrier: 'ups',
      trackingNumber,
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      status: 'created',
      events: [
        {
          timestamp: new Date(),
          status: 'created',
          location: { city: 'Louisville', state: 'KY', country: 'US', zip: '40223' },
          description: 'Order processed',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockTrackingHistory[trackingNumber] = shipment;

    return {
      trackingNumber,
      labelUrl: `https://onlinetools.ups.com/track/v1/details/${trackingNumber}.pdf`,
      carrier: 'ups',
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
    const baseRate = 10.99;
    const weightFactor = weight * 0.45;
    const totalAmount = Math.round((baseRate + weightFactor) * 100);

    return {
      amount: totalAmount,
      estimatedDays: 2,
    };
  }

  async initiateReturn(trackingNumber: string): Promise<{ returnTrackingNumber: string; labelUrl: string }> {
    return {
      returnTrackingNumber: generateTrackingNumber(),
      labelUrl: `https://onlinetools.ups.com/track/v1/returnLabel/${trackingNumber}.pdf`,
    };
  }

  async verifyDelivery(trackingNumber: string): Promise<boolean> {
    const shipment = await this.getTracking(trackingNumber);
    return shipment.status === 'delivered';
  }
}
