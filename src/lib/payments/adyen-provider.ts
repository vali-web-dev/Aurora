/**
 * Adyen Payment Provider Implementation
 */

import { IPaymentProvider, PaymentIntent, PaymentMethod, PaymentConfirmation, PaymentRefund, WebhookEvent } from './types';

interface AdyenConfig {
  apiKey: string;
  merchantAccount: string;
  clientKey: string;
}

export class AdyenProvider implements IPaymentProvider {
  name: 'adyen' = 'adyen';
  private apiKey: string;
  private merchantAccount: string;
  private clientKey: string;
  private baseUrl = 'https://checkout-test.adyen.com/v71';

  constructor(config?: AdyenConfig) {
    this.apiKey = config?.apiKey || process.env.ADYEN_API_KEY || '';
    this.merchantAccount = config?.merchantAccount || process.env.ADYEN_MERCHANT_ACCOUNT || '';
    this.clientKey = config?.clientKey || process.env.ADYEN_CLIENT_KEY || '';
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, any>
  ): Promise<PaymentIntent> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify({
          merchantAccount: this.merchantAccount,
          amount: {
            value: amount,
            currency,
          },
          reference: metadata.orderId || `order-${Date.now()}`,
          returnUrl: metadata.returnUrl || 'http://localhost:3000/commerce/checkout',
          metadata,
        }),
      });

      const data = await response.json();

      return {
        id: data.id || `adyen-${Date.now()}`,
        provider: 'adyen',
        clientSecret: data.sessionData || '',
        amount,
        currency,
        status: 'requires_payment_method',
        metadata: data.metadata || metadata,
      };
    } catch (error: any) {
      throw new Error(`Adyen session creation failed: ${error.message}`);
    }
  }

  async retrievePaymentIntent(intentId: string): Promise<PaymentIntent> {
    // Adyen doesn't have a direct retrieve for sessions, mock return
    return {
      id: intentId,
      provider: 'adyen',
      amount: 0,
      currency: 'USD',
      status: 'requires_payment_method',
      metadata: {},
    };
  }

  async confirmPayment(intentId: string, paymentMethodId: string): Promise<PaymentConfirmation> {
    try {
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify({
          amount: { value: 0, currency: 'USD' },
          reference: intentId,
          paymentMethod: { type: 'scheme', storedPaymentMethodId: paymentMethodId },
          merchantAccount: this.merchantAccount,
        }),
      });

      const data = await response.json();

      return {
        intentId,
        provider: 'adyen',
        status: data.resultCode === 'Authorised' ? 'succeeded' : 'processing',
        metadata: data,
      };
    } catch (error: any) {
      return {
        intentId,
        provider: 'adyen',
        status: 'failed',
        errorMessage: error.message,
        metadata: {},
      };
    }
  }

  async getClientToken(intentId: string): Promise<string> {
    return this.clientKey;
  }

  async listPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/listRecurringDetails?merchant=${this.merchantAccount}&customer=${customerId}`,
        {
          method: 'GET',
          headers: {
            'X-API-Key': this.apiKey,
          },
        }
      );

      const data = await response.json();
      return data.recurringDetails?.map((detail: any) => ({
        id: detail.RecurringDetailReference,
        provider: 'adyen',
        type: 'card',
        last4: detail.Card?.number?.slice(-4) || '',
        brand: detail.Card?.brand || '',
        expMonth: detail.Card?.expiryMonth ? parseInt(detail.Card.expiryMonth) : undefined,
        expYear: detail.Card?.expiryYear ? parseInt(detail.Card.expiryYear) : undefined,
        isDefault: detail.RecurringDetailReference === 'LATEST',
      })) || [];
    } catch {
      return [];
    }
  }

  async savePaymentMethod(customerId: string, paymentMethodData: Record<string, any>): Promise<PaymentMethod> {
    // Mock implementation - In production, implement Adyen's recurring payment setup
    return {
      id: `adyen-${Date.now()}`,
      provider: 'adyen',
      type: 'card',
      last4: paymentMethodData.last4 || '****',
      brand: paymentMethodData.brand || 'visa',
      isDefault: false,
    };
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/disableRecurringDetail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify({
          merchantAccount: this.merchantAccount,
          recurringDetailReference: paymentMethodId,
        }),
      });
    } catch {
      // Silently fail
    }
  }

  async refundPayment(chargeId: string, amount?: number, reason?: string): Promise<PaymentRefund> {
    try {
      const response = await fetch(`${this.baseUrl}/refunds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify({
          merchantAccount: this.merchantAccount,
          originalReference: chargeId,
          reference: `refund-${Date.now()}`,
          amount: { value: amount || 0, currency: 'USD' },
        }),
      });

      const data = await response.json();

      return {
        id: data.pspReference || `refund-${Date.now()}`,
        chargeId,
        amount: amount || 0,
        currency: 'USD',
        status: data.resultCode === 'Received' ? 'processing' : 'failed',
        reason: (reason || 'requested_by_customer') as any,
        createdAt: new Date(),
      };
    } catch (error: any) {
      return {
        id: `refund-${Date.now()}`,
        chargeId,
        amount: amount || 0,
        currency: 'USD',
        status: 'failed',
        reason: (reason || 'requested_by_customer') as any,
        createdAt: new Date(),
      };
    }
  }

  async handleWebhook(body: any, signature: string): Promise<WebhookEvent> {
    // Adyen webhook verification would go here
    return {
      id: body.notificationItems?.[0]?.NotificationRequestItem?.pspReference || '',
      type: body.notificationItems?.[0]?.NotificationRequestItem?.eventCode || 'unknown',
      provider: 'adyen',
      data: body,
      timestamp: new Date(),
      verified: true, // In production, verify signature
    };
  }
}
