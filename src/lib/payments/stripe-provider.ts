/**
 * Stripe Payment Provider Implementation
 */

import Stripe from 'stripe';
import { IPaymentProvider, PaymentIntent, PaymentMethod, PaymentConfirmation, PaymentRefund, WebhookEvent } from './types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
});

export class StripeProvider implements IPaymentProvider {
  name: 'stripe' = 'stripe';

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, any>
  ): Promise<PaymentIntent> {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
      metadata,
    });

    return {
      id: intent.id,
      provider: 'stripe',
      clientSecret: intent.client_secret || '',
      amount: intent.amount,
      currency: intent.currency,
      status: this.mapStripeStatus(intent.status),
      metadata: intent.metadata || {},
    };
  }

  async retrievePaymentIntent(intentId: string): Promise<PaymentIntent> {
    const intent = await stripe.paymentIntents.retrieve(intentId);

    return {
      id: intent.id,
      provider: 'stripe',
      clientSecret: intent.client_secret || '',
      amount: intent.amount,
      currency: intent.currency,
      status: this.mapStripeStatus(intent.status),
      metadata: intent.metadata || {},
    };
  }

  async confirmPayment(intentId: string, paymentMethodId: string): Promise<PaymentConfirmation> {
    try {
      const intent = await stripe.paymentIntents.confirm(intentId, {
        payment_method: paymentMethodId,
      });

      return {
        intentId: intent.id,
        provider: 'stripe',
        status: intent.status === 'succeeded' ? 'succeeded' : 'processing',
        receiptUrl: intent.charges.data[0]?.receipt_url,
        metadata: intent.metadata || {},
      };
    } catch (error: any) {
      return {
        intentId,
        provider: 'stripe',
        status: 'failed',
        errorMessage: error.message,
        metadata: {},
      };
    }
  }

  async getClientToken(intentId: string): Promise<string> {
    const intent = await stripe.paymentIntents.retrieve(intentId);
    return intent.client_secret || '';
  }

  async listPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    const methods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return methods.data.map(method => ({
      id: method.id,
      provider: 'stripe',
      type: 'card',
      last4: method.card?.last4 || '',
      brand: method.card?.brand || '',
      expMonth: method.card?.exp_month,
      expYear: method.card?.exp_year,
      isDefault: false,
    }));
  }

  async savePaymentMethod(customerId: string, paymentMethodData: Record<string, any>): Promise<PaymentMethod> {
    const method = await stripe.paymentMethods.create({
      type: 'card',
      card: paymentMethodData.card,
    });

    // Attach to customer
    await stripe.paymentMethods.attach(method.id, {
      customer: customerId,
    });

    return {
      id: method.id,
      provider: 'stripe',
      type: 'card',
      last4: method.card?.last4 || '',
      brand: method.card?.brand || '',
      expMonth: method.card?.exp_month,
      expYear: method.card?.exp_year,
      isDefault: false,
    };
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    await stripe.paymentMethods.detach(paymentMethodId);
  }

  async refundPayment(chargeId: string, amount?: number, reason?: string): Promise<PaymentRefund> {
    const refund = await stripe.refunds.create({
      charge: chargeId,
      amount,
      reason: reason as any,
    });

    return {
      id: refund.id,
      chargeId: refund.charge || '',
      amount: refund.amount,
      currency: 'usd',
      status: refund.status === 'succeeded' ? 'succeeded' : 'processing',
      reason: (reason || 'other') as any,
      createdAt: new Date(refund.created * 1000),
    };
  }

  async handleWebhook(body: any, signature: string): Promise<WebhookEvent> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    
    try {
      const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

      return {
        id: event.id,
        type: event.type,
        provider: 'stripe',
        data: event.data as Record<string, any>,
        timestamp: new Date(event.created * 1000),
        verified: true,
      };
    } catch (error: any) {
      return {
        id: '',
        type: 'error',
        provider: 'stripe',
        data: { error: error.message },
        timestamp: new Date(),
        verified: false,
      };
    }
  }

  private mapStripeStatus(status: string): PaymentIntent['status'] {
    const map: Record<string, PaymentIntent['status']> = {
      requires_payment_method: 'requires_payment_method',
      requires_confirmation: 'requires_confirmation',
      processing: 'processing',
      succeeded: 'succeeded',
      canceled: 'canceled',
      failed: 'failed',
    };
    return map[status] || 'requires_payment_method';
  }
}
