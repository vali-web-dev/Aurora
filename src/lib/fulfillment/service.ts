/**
 * Fulfillment Service Factory
 * Unified interface for carrier operations across multiple providers
 */

import { ICarrier, Carrier, Shipment, ShipmentCreationRequest, CarrierLabel } from './types';
import { FedExCarrier } from './fedex-carrier';
import { UPSCarrier } from './ups-carrier';
import { DHLCarrier } from './dhl-carrier';

class FulfillmentService {
  private carriers: Map<Carrier, ICarrier> = new Map();
  private defaultCarrier: Carrier;

  constructor(defaultCarrier: Carrier = 'fedex') {
    this.defaultCarrier = defaultCarrier;
    this.carriers.set('fedex', new FedExCarrier());
    this.carriers.set('ups', new UPSCarrier());
    this.carriers.set('dhl', new DHLCarrier());
  }

  /**
   * Get a carrier instance
   */
  getCarrier(carrier?: Carrier): ICarrier {
    const c = carrier || this.defaultCarrier;
    const instance = this.carriers.get(c);
    if (!instance) {
      throw new Error(`Carrier '${c}' not found`);
    }
    return instance;
  }

  /**
   * Create a shipment
   */
  async createShipment(
    request: ShipmentCreationRequest,
    carrier?: Carrier
  ): Promise<CarrierLabel> {
    return this.getCarrier(carrier).createShipment(request);
  }

  /**
   * Get tracking information
   */
  async getTracking(trackingNumber: string, carrier?: Carrier): Promise<Shipment> {
    return this.getCarrier(carrier).getTracking(trackingNumber);
  }

  /**
   * Cancel a shipment
   */
  async cancelShipment(trackingNumber: string, carrier?: Carrier): Promise<void> {
    return this.getCarrier(carrier).cancelShipment(trackingNumber);
  }

  /**
   * Get shipping rate
   */
  async getRate(
    origin: { zip: string; country: string },
    dest: { zip: string; country: string; state: string },
    weight: number,
    length?: number,
    width?: number,
    height?: number,
    carrier?: Carrier
  ): Promise<{ amount: number; estimatedDays: number }> {
    return this.getCarrier(carrier).getRate(
      origin,
      dest,
      weight,
      length || 0,
      width || 0,
      height || 0
    );
  }

  /**
   * Initiate a return
   */
  async initiateReturn(trackingNumber: string, carrier?: Carrier): Promise<{ returnTrackingNumber: string; labelUrl: string }> {
    return this.getCarrier(carrier).initiateReturn(trackingNumber);
  }

  /**
   * Verify delivery
   */
  async verifyDelivery(trackingNumber: string, carrier?: Carrier): Promise<boolean> {
    return this.getCarrier(carrier).verifyDelivery(trackingNumber);
  }

  /**
   * Set default carrier
   */
  setDefaultCarrier(carrier: Carrier): void {
    if (!this.carriers.has(carrier)) {
      throw new Error(`Carrier '${carrier}' not registered`);
    }
    this.defaultCarrier = carrier;
  }

  /**
   * Get default carrier name
   */
  getDefaultCarrier(): Carrier {
    return this.defaultCarrier;
  }

  /**
   * Get all available carriers
   */
  getAvailableCarriers(): Carrier[] {
    return Array.from(this.carriers.keys());
  }
}

// Singleton instance
export const fulfillmentService = new FulfillmentService(
  (process.env.DEFAULT_CARRIER as Carrier) || 'fedex'
);

export default fulfillmentService;
