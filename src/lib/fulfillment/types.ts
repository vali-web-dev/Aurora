/**
 * Fulfillment & Carrier Tracking Type Definitions
 */

export type Carrier = 'fedex' | 'ups' | 'dhl';

export type ShipmentStatus = 
  | 'created'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'returned';

export interface TrackingEvent {
  timestamp: Date;
  status: ShipmentStatus;
  location: {
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  };
  description: string;
  eventCode?: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  carrier: Carrier;
  trackingNumber: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  status: ShipmentStatus;
  events: TrackingEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ShipmentCreationRequest {
  orderId: string;
  carrier: Carrier;
  recipientName: string;
  recipientEmail: string;
  shipmentAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  packages: {
    weight: number;  // in lbs
    length: number;  // in inches
    width: number;
    height: number;
    value: number;   // in cents
  }[];
  shippingMethod?: 'standard' | 'overnight' | 'express';
}

export interface CarrierLabel {
  trackingNumber: string;
  labelUrl: string;
  carrier: Carrier;
  expiresAt?: Date;
}

/**
 * Carrier Integration Interface
 */
export interface ICarrier {
  name: Carrier;

  /**
   * Create a shipment and generate label
   */
  createShipment(request: ShipmentCreationRequest): Promise<CarrierLabel>;

  /**
   * Get tracking information for a shipment
   */
  getTracking(trackingNumber: string): Promise<Shipment>;

  /**
   * Cancel a shipment
   */
  cancelShipment(trackingNumber: string): Promise<void>;

  /**
   * Get shipping rate estimate
   */
  getRate(
    origins: { zip: string; country: string },
    dest: { zip: string; country: string; state: string },
    weight: number,
    length: number,
    width: number,
    height: number
  ): Promise<{ amount: number; estimatedDays: number }>;

  /**
   * Return a package
   */
  initiateReturn(trackingNumber: string): Promise<{ returnTrackingNumber: string; labelUrl: string }>;

  /**
   * Verify delivery
   */
  verifyDelivery(trackingNumber: string): Promise<boolean>;
}
