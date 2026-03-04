/**
 * Event Tracking System
 * Captures user actions and system events for analytics
 */

export type EventCategory =
  | 'commerce'
  | 'payment'
  | 'fulfillment'
  | 'user'
  | 'system'
  | 'performance'
  | 'error';

export type EventAction =
  // Commerce
  | 'browse_products'
  | 'view_product'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'view_cart'
  | 'start_checkout'
  | 'complete_checkout'
  // Payment
  | 'create_payment_intent'
  | 'confirm_payment'
  | 'payment_success'
  | 'payment_failed'
  | 'refund_initiated'
  | 'refund_completed'
  // Fulfillment
  | 'shipment_created'
  | 'tracking_updated'
  | 'delivery_confirmed'
  | 'return_initiated'
  // User
  | 'sign_up'
  | 'sign_in'
  | 'sign_out'
  | 'profile_updated'
  // System
  | 'api_call'
  | 'page_load'
  | 'error_occurred'
  | 'performance_metric';

export interface Event {
  id: string;
  timestamp: Date;
  category: EventCategory;
  action: EventAction;
  userId?: string;
  sessionId?: string;
  orderId?: string;
  productId?: string;
  value?: number; // Monetary value in cents
  metadata: Record<string, any>;
  source: 'client' | 'server';
  userAgent?: string;
  ipAddress?: string;
}

export interface EventBatch {
  events: Event[];
  timestamp: Date;
  batchId: string;
}

export interface AnalyticsMetrics {
  date: Date;
  category: EventCategory;
  action?: EventAction;
  count: number;
  uniqueUsers: number;
  value?: number;
  avgValue?: number;
}

export interface AnalyticsFilter {
  startDate?: Date;
  endDate?: Date;
  category?: EventCategory;
  action?: EventAction;
  userId?: string;
  orderId?: string;
  limit?: number;
  offset?: number;
}

/**
 * In-memory event store (replace with database in production)
 */
export class EventStore {
  private events: Event[] = [];
  private maxEvents = 10000; // Keep last 10k events in memory

  addEvent(event: Event): void {
    this.events.push(event);
    
    // Trim old events if exceeding max
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  addBatch(batch: EventBatch): void {
    batch.events.forEach(event => this.addEvent(event));
  }

  getEvents(filter?: AnalyticsFilter): Event[] {
    let filtered = this.events;

    if (filter?.category) {
      filtered = filtered.filter(e => e.category === filter.category);
    }

    if (filter?.action) {
      filtered = filtered.filter(e => e.action === filter.action);
    }

    if (filter?.userId) {
      filtered = filtered.filter(e => e.userId === filter.userId);
    }

    if (filter?.orderId) {
      filtered = filtered.filter(e => e.metadata.orderId === filter.orderId);
    }

    if (filter?.startDate) {
      filtered = filtered.filter(e => e.timestamp >= filter.startDate!);
    }

    if (filter?.endDate) {
      filtered = filtered.filter(e => e.timestamp <= filter.endDate!);
    }

    if (filter?.limit) {
      filtered = filtered.slice(0, filter.limit);
    }

    if (filter?.offset) {
      filtered = filtered.slice(filter.offset);
    }

    return filtered;
  }

  getMetrics(category?: EventCategory, action?: EventAction): AnalyticsMetrics[] {
    const grouped = new Map<string, Event[]>();

    this.events
      .filter(e => !category || e.category === category)
      .filter(e => !action || e.action === action)
      .forEach(event => {
        const key = `${event.timestamp.toISOString().split('T')[0]}-${event.category}-${event.action}`;
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)!.push(event);
      });

    return Array.from(grouped.entries()).map(([key, events]) => {
      const unique = new Set(events.map(e => e.userId || 'anonymous'));
      const values = events.filter(e => e.value).map(e => e.value!);

      return {
        date: events[0].timestamp,
        category: events[0].category,
        action: events[0].action,
        count: events.length,
        uniqueUsers: unique.size,
        value: values.reduce((a, b) => a + b, 0),
        avgValue: values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : undefined,
      };
    });
  }

  clear(): void {
    this.events = [];
  }
}

export const eventStore = new EventStore();
