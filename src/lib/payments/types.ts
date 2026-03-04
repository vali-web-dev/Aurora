/**
 * Payment Provider Type Definitions
 * Abstraction layer for multiple payment processors
 */

export type PaymentProvider = 'stripe' | 'adyen';

export interface PaymentIntent {
  id: string;
  provider: PaymentProvider;
  clientSecret?: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'processing' | 'succeeded' | 'canceled' | 'failed';
  metadata: Record<string, any>;
}

export interface PaymentMethod {
  id: string;
  provider: PaymentProvider;
  type: 'card' | 'bank_account' | 'wallet';
  last4: string;
  brand: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
}

export interface PaymentConfirmation {
  intentId: string;
  provider: PaymentProvider;
  status: 'succeeded' | 'processing' | 'requires_action' | 'failed';
  receiptUrl?: string;
  errorMessage?: string;
  metadata: Record<string, any>;
}

export interface PaymentRefund {
  id: string;
  chargeId: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'processing' | 'failed';
  reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'other';
  createdAt: Date;
}

export interface WebhookEvent {
  id: string;
  type: string;
  provider: PaymentProvider;
  data: Record<string, any>;
  timestamp: Date;
  verified: boolean;
}

/**
 * Payment Provider Interface
 * Implement this for each payment processor
 */
export interface IPaymentProvider {
  name: PaymentProvider;
  
  /**
   * Create a payment intent
   */
  createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, any>
  ): Promise<PaymentIntent>;

  /**
   * Retrieve an existing payment intent
   */
  retrievePaymentIntent(intentId: string): Promise<PaymentIntent>;

  /**
   * Confirm a payment intent
   */
  confirmPayment(
    intentId: string,
    paymentMethodId: string
  ): Promise<PaymentConfirmation>;

  /**
   * Get client-side token for payment UI
   */
  getClientToken(intentId: string): Promise<string>;

  /**
   * List payment methods for a customer
   */
  listPaymentMethods(customerId: string): Promise<PaymentMethod[]>;

  /**
   * Save a payment method
   */
  savePaymentMethod(
    customerId: string,
    paymentMethodData: Record<string, any>
  ): Promise<PaymentMethod>;

  /**
   * Delete a payment method
   */
  deletePaymentMethod(paymentMethodId: string): Promise<void>;

  /**
   * Refund a payment
   */
  refundPayment(
    chargeId: string,
    amount?: number,
    reason?: string
  ): Promise<PaymentRefund>;

  /**
   * Handle webhook events
   */
  handleWebhook(body: any, signature: string): Promise<WebhookEvent>;
}
