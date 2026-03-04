/**
 * FedEx Carrier Implementation (Mock)
 * In production, integrate with FedEx WebServices API
 */

import { ICarrier, Carrier, Shipment, ShipmentCreationRequest, CarrierLabel, ShipmentStatus, TrackingEvent } from './types';

const mockTrackingHistory: Record<string, Shipment> = {};

const statuses: ShipmentStatus[] = ['created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];

function generateTrackingNumber(): string {
  return `79${Math.random().toString().slice(2, 14)}`;
}

function simulateTrackingEvents(orderedAt: Date): TrackingEvent[] {
  const now = new Date();
  const hoursElapsed = (now.getTime() - orderedAt.getTime()) / (1000 * 60 * 60);
  
  const events: TrackingEvent[] = [];
  
  // Created (immediate)
  events.push({
    timestamp: orderedAt,
    status: 'created',
    location: { city: 'Memphis', state: 'TN', country: 'US', zip: '38131' },
    description: 'Shipment information received by FedEx',
    eventCode: 'OC',
  });

  if (hoursElapsed >= 4) {
    events.push({
      timestamp: new Date(orderedAt.getTime() + 4 * 60 * 60 * 1000),
      status: 'picked_up',
      location: { city: 'Memphis', state: 'TN', country: 'US', zip: '38131' },
      description: 'Package picked up',
      eventCode: 'PU',
    });
  }

  if (hoursElapsed >= 12) {
    events.push({
      timestamp: new Date(orderedAt.getTime() + 12 * 60 * 60 * 1000),
      status: 'in_transit',
      location: { city: 'Indianapolis', state: 'IN', country: 'US', zip: '46225' },
      description: 'In transit',
      eventCode: 'IT',
    });
  }

  if (hoursElapsed >= 36) {
    events.push({
      timestamp: new Date(orderedAt.getTime() + 36 * 60 * 60 * 1000),
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
      description: 'Package delivered',
      eventCode: 'DL',
    });
  }

  return events;
}

export class FedExCarrier implements ICarrier {
  name: Carrier = 'fedex';
  private apiKey = process.env.FEDEX_API_KEY || 'mock-key';
  private accountNum = process.env.FEDEX_ACCOUNT_NUM || '123456789';

  async createShipment(request: ShipmentCreationRequest): Promise<CarrierLabel> {
    const trackingNumber = generateTrackingNumber();
    
    const shipment: Shipment = {
      id: `sg_${Date.now()}`,
      orderId: request.orderId,
      carrier: 'fedex',
      trackingNumber,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      status: 'created',
      events: [
        {
          timestamp: new Date(),
          status: 'created',
          location: { city: 'Memphis', state: 'TN', country: 'US', zip: '38131' },
          description: 'Shipment information received by FedEx',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockTrackingHistory[trackingNumber] = shipment;

    return {
      trackingNumber,
      labelUrl: `https://apis.fedex.com/labelImage/${trackingNumber}.pdf`,
      carrier: 'fedex',
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
    weight: number,
    length: number,
    width: number,
    height: number
  ): Promise<{ amount: number; estimatedDays: number }> {
    // Mock calculation
    const baseRate = 9.99;
    const weightFactor = weight * 0.5; // $0.50 per lb
    const distanceFactor = origin.zip === dest.zip ? 0 : 5; // $5 for different zip
    const totalAmount = Math.round((baseRate + weightFactor + distanceFactor) * 100);

    return {
      amount: totalAmount,
      estimatedDays: 3,
    };
  }

  async initiateReturn(trackingNumber: string): Promise<{ returnTrackingNumber: string; labelUrl: string }> {
    return {
      returnTrackingNumber: generateTrackingNumber(),
      labelUrl: `https://apis.fedex.com/returnLabel/${trackingNumber}.pdf`,
    };
  }

  async verifyDelivery(trackingNumber: string): Promise<boolean> {
    const shipment = await this.getTracking(trackingNumber);
    return shipment.status === 'delivered';
  }
}
