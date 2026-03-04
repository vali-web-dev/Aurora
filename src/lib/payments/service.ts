/**
 * Payment Service Factory
 * Unified interface for payment operations across multiple providers
 */

import { IPaymentProvider, PaymentProvider, PaymentIntent, PaymentMethod, PaymentConfirmation, PaymentRefund, WebhookEvent } from './types';
import { StripeProvider } from './stripe-provider';
import { AdyenProvider } from './adyen-provider';

class PaymentService {
  private providers: Map<PaymentProvider, IPaymentProvider> = new Map();
  private defaultProvider: PaymentProvider;

  constructor(defaultProvider: PaymentProvider = 'stripe') {
    this.defaultProvider = defaultProvider;
    this.providers.set('stripe', new StripeProvider());
    this.providers.set('adyen', new AdyenProvider());
  }

  /**
   * Get a provider instance
   */
  getProvider(provider?: PaymentProvider): IPaymentProvider {
    const p = provider || this.defaultProvider;
    const instance = this.providers.get(p);
    if (!instance) {
      throw new Error(`Payment provider '${p}' not found`);
    }
    return instance;
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, any>,
    provider?: PaymentProvider
  ): Promise<PaymentIntent> {
    return this.getProvider(provider).createPaymentIntent(amount, currency, metadata);
  }

  /**
   * Retrieve a payment intent
   */
  async retrievePaymentIntent(intentId: string, provider?: PaymentProvider): Promise<PaymentIntent> {
    return this.getProvider(provider).retrievePaymentIntent(intentId);
  }

  /**
   * Confirm a payment
   */
  async confirmPayment(
    intentId: string,
    paymentMethodId: string,
    provider?: PaymentProvider
  ): Promise<PaymentConfirmation> {
    return this.getProvider(provider).confirmPayment(intentId, paymentMethodId);
  }

  /**
   * Get client token for frontend
   */
  async getClientToken(intentId: string, provider?: PaymentProvider): Promise<string> {
    return this.getProvider(provider).getClientToken(intentId);
  }

  /**
   * List payment methods
   */
  async listPaymentMethods(customerId: string, provider?: PaymentProvider): Promise<PaymentMethod[]> {
    return this.getProvider(provider).listPaymentMethods(customerId);
  }

  /**
   * Save a payment method
   */
  async savePaymentMethod(
    customerId: string,
    paymentMethodData: Record<string, any>,
    provider?: PaymentProvider
  ): Promise<PaymentMethod> {
    return this.getProvider(provider).savePaymentMethod(customerId, paymentMethodData);
  }

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(paymentMethodId: string, provider?: PaymentProvider): Promise<void> {
    return this.getProvider(provider).deletePaymentMethod(paymentMethodId);
  }

  /**
   * Refund a payment
   */
  async refundPayment(
    chargeId: string,
    amount?: number,
    reason?: string,
    provider?: PaymentProvider
  ): Promise<PaymentRefund> {
    return this.getProvider(provider).refundPayment(chargeId, amount, reason);
  }

  /**
   * Handle webhook event
   */
  async handleWebhook(body: any, signature: string, provider?: PaymentProvider): Promise<WebhookEvent> {
    return this.getProvider(provider).handleWebhook(body, signature);
  }

  /**
   * Set default provider
   */
  setDefaultProvider(provider: PaymentProvider): void {
    if (!this.providers.has(provider)) {
      throw new Error(`Payment provider '${provider}' not registered`);
    }
    this.defaultProvider = provider;
  }

  /**
   * Get default provider name
   */
  getDefaultProvider(): PaymentProvider {
    return this.defaultProvider;
  }
}

// Singleton instance
export const paymentService = new PaymentService(
  (process.env.PAYMENT_PROVIDER as PaymentProvider) || 'stripe'
);

export default paymentService;
