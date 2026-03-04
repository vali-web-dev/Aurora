/**
 * Invoice Service Implementation
 * Handles invoice generation, rendering, and delivery
 */

import { Invoice, IInvoiceService, InvoiceLineItem } from './types';
import { createInvoiceHTML } from './template';

// In-memory storage (should use database in production)
const invoicesDb: Record<string, Invoice> = {};

export class InvoiceService implements IInvoiceService {
  private storageBasePath = process.env.INVOICE_STORAGE_PATH || './invoices';

  async generateFromOrder(orderId: string, orderData: any): Promise<Invoice> {
    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    
    const lineItems: InvoiceLineItem[] = orderData.cartItems?.map((item: any) => ({
      productId: item.productId,
      productName: item.productName || `Product ${item.productId}`,
      quantity: item.quantity,
      unitPrice: item.unitPriceCents,
      tax: Math.round((item.unitPriceCents * item.quantity) * 0.13),
      total: item.unitPriceCents * item.quantity,
    })) || [];

    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const tax = lineItems.reduce((sum, item) => sum + item.tax, 0);
    const shipping = orderData.shippingCostCents || 0;

    const invoice: Invoice = {
      id: `inv_${Date.now()}`,
      orderId,
      invoiceNumber,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days

      // Customer details
      customerName: orderData.customerName || 'Valued Customer',
      customerEmail: orderData.customerEmail || '',
      billingAddress: orderData.billingAddress || {
        street: '123 Main St',
        city: 'City',
        state: 'ST',
        zip: '12345',
        country: 'US',
      },
      shippingAddress: orderData.shippingAddress,

      // Items
      lineItems,

      // Totals
      subtotal,
      tax,
      shipping,
      discount: orderData.discountCents || 0,
      total: subtotal + tax + shipping - (orderData.discountCents || 0),
      currency: orderData.currency || 'USD',

      // Payment
      paymentMethod: orderData.paymentMethod || 'Credit Card',
      paymentStatus: 'paid',
      transactionId: orderData.transactionId,

      // Fulfillment
      trackingNumber: orderData.trackingNumber,
      carrier: orderData.carrier,
      estimatedDelivery: orderData.estimatedDelivery,

      // Notes
      notes: 'Thank you for your purchase!',
      terms: 'Payment due upon receipt',

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store invoice
    invoicesDb[invoice.id] = invoice;

    return invoice;
  }

  async renderHTML(invoice: Invoice): Promise<string> {
    return createInvoiceHTML(invoice);
  }

  async renderPDF(html: string, filename?: string): Promise<Buffer> {
    // In production, use puppeteer or similar:
    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    // await page.setContent(html);
    // const pdf = await page.pdf({ format: 'A4' });
    // await browser.close();
    // return pdf;

    // Mock: Return HTML as buffer with PDF comment
    return Buffer.from(`%PDF-1.4\n${html}`, 'utf8');
  }

  async saveInvoice(invoice: Invoice): Promise<void> {
    invoicesDb[invoice.id] = {
      ...invoice,
      updatedAt: new Date(),
    };
    
    // TODO: Save to database and/or file storage
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    const invoice = invoicesDb[invoiceId];
    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }
    return invoice;
  }

  async listInvoices(customerId: string): Promise<Invoice[]> {
    return Object.values(invoicesDb).filter(inv => 
      inv.customerEmail?.includes(customerId) ||
      inv.orderId?.includes(customerId)
    );
  }

  async emailInvoice(invoice: Invoice, to: string, message?: string): Promise<void> {
    try {
      // TODO: Implement SendGrid or other email provider
      const html = await this.renderHTML(invoice);
      
      console.log(`[Mock Email] Sending invoice ${invoice.invoiceNumber} to ${to}`);
      console.log(`Subject: Invoice ${invoice.invoiceNumber}`);
      console.log(`Message: ${message || 'Please find your invoice attached.'}`);
      
      // In production:
      // await sendgridClient.send({
      //   to,
      //   from: process.env.EMAIL_FROM,
      //   subject: `Invoice ${invoice.invoiceNumber}`,
      //   html,
      //   attachments: [{
      //     filename: `${invoice.invoiceNumber}.pdf`,
      //     content: await this.renderPDF(html),
      //     type: 'application/pdf'
      //   }]
      // });
    } catch (error: any) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  async downloadPDF(invoiceId: string): Promise<Buffer> {
    const invoice = await this.getInvoice(invoiceId);
    const html = await this.renderHTML(invoice);
    return this.renderPDF(html, `${invoice.invoiceNumber}.pdf`);
  }

  getDownloadUrl(invoiceId: string): string {
    return `/api/invoices/${invoiceId}/download`;
  }
}

// Singleton instance
export const invoiceService = new InvoiceService();

export default invoiceService;
