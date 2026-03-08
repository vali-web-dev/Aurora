/**
 * Adyen Payment Provider Implementation
 */

import crypto from 'crypto';
import { IPaymentProvider, PaymentIntent, PaymentMethod, PaymentConfirmation, PaymentRefund, WebhookEvent } from './types';

interface AdyenConfig {
  apiKey: string;
  merchantAccount: string;
  clientKey: string;
}

const adyenSessionCache = new Map<string, PaymentIntent>();

function timingSafeEqualString(a: string, b: string): boolean {
  const aBuf = Buffer.from(a || '', 'utf8');
  const bBuf = Buffer.from(b || '', 'utf8');
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function escapeHmacValue(value: string): string {
  return (value || '').replace(/\\/g, '\\\\').replace(/:/g, '\\:');
}

function buildAdyenSigningData(item: any): string {
  const amount = item?.amount || {};
  const fields = [
    item?.pspReference,
    item?.originalReference,
    item?.merchantAccountCode,
    item?.merchantReference,
    amount?.value != null ? String(amount.value) : '',
    amount?.currency,
    item?.eventCode,
    item?.success,
  ];

  return fields.map((value) => escapeHmacValue(value || '')).join(':');
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

      const intent: PaymentIntent = {
        id: data.id || `adyen-${Date.now()}`,
        provider: 'adyen',
        clientSecret: data.sessionData || '',
        amount,
        currency,
        status: 'requires_payment_method',
        metadata: data.metadata || metadata,
      };

      adyenSessionCache.set(intent.id, intent);
      return intent;
    } catch (error: any) {
      throw new Error(`Adyen session creation failed: ${error.message}`);
    }
  }

  async retrievePaymentIntent(intentId: string): Promise<PaymentIntent> {
    const cached = adyenSessionCache.get(intentId);

    try {
      const response = await fetch(`${this.baseUrl}/sessions/${encodeURIComponent(intentId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        if (cached) {
          return cached;
        }
        const text = await response.text().catch(() => '');
        throw new Error(`Adyen session retrieve failed: ${response.status} ${text}`);
      }

      const data = await response.json();
      const intent: PaymentIntent = {
        id: data.id || intentId,
        provider: 'adyen',
        clientSecret: data.sessionData || cached?.clientSecret || '',
        amount: cached?.amount || 0,
        currency: cached?.currency || 'USD',
        status: 'requires_payment_method',
        metadata: data.metadata || cached?.metadata || {},
      };

      adyenSessionCache.set(intent.id, intent);
      return intent;
    } catch (error: any) {
      if (cached) {
        return cached;
      }
      throw new Error(`Adyen intent retrieval failed: ${error.message}`);
    }
  }

  async confirmPayment(intentId: string, paymentMethodId: string): Promise<PaymentConfirmation> {
    const cached = adyenSessionCache.get(intentId);

    try {
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify({
          amount: {
            value: cached?.amount || 0,
            currency: cached?.currency || 'USD',
          },
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
        metadata: {
          ...data,
          ...(cached?.metadata || {}),
        },
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
    const storedPaymentMethodId =
      paymentMethodData.storedPaymentMethodId || paymentMethodData.id;

    if (!storedPaymentMethodId || typeof storedPaymentMethodId !== 'string') {
      throw new Error(
        'Adyen payment method save requires a tokenized storedPaymentMethodId from Checkout Components.'
      );
    }

    return {
      id: storedPaymentMethodId,
      provider: 'adyen',
      type: 'card',
      last4: paymentMethodData.last4 || '****',
      brand: paymentMethodData.brand || 'visa',
      expMonth: paymentMethodData.expMonth,
      expYear: paymentMethodData.expYear,
      isDefault: Boolean(paymentMethodData.isDefault),
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
    let parsedBody: any = body;
    if (typeof body === 'string') {
      try {
        parsedBody = JSON.parse(body);
      } catch {
        return {
          id: '',
          type: 'invalid_payload',
          provider: 'adyen',
          data: {},
          timestamp: new Date(),
          verified: false,
        };
      }
    }

    const item = parsedBody?.notificationItems?.[0]?.NotificationRequestItem;
    const authToken = process.env.ADYEN_WEBHOOK_AUTH_TOKEN || '';
    const hmacKey = process.env.ADYEN_HMAC_KEY || '';
    const isProduction = process.env.NODE_ENV === 'production';

    let verified = false;

    if (authToken) {
      verified = timingSafeEqualString(signature || '', authToken);
    }

    if (!verified && hmacKey && item?.additionalData?.hmacSignature) {
      const signingData = buildAdyenSigningData(item);
      const expected = crypto
        .createHmac('sha256', Buffer.from(hmacKey, 'base64'))
        .update(signingData, 'utf8')
        .digest('base64');

      verified = timingSafeEqualString(item.additionalData.hmacSignature, expected);
    }

    if (!authToken && !hmacKey) {
      verified = !isProduction;
      if (!verified) {
        console.error('[Adyen] Webhook verification configuration missing in production.');
      }
    }

    return {
      id: item?.pspReference || '',
      type: item?.eventCode || 'unknown',
      provider: 'adyen',
      data: parsedBody,
      timestamp: new Date(),
      verified,
    };
  }
}
