/**
 * Invoice Service Implementation
 * Handles invoice generation, rendering, and delivery
 */

import { Invoice, IInvoiceService, InvoiceLineItem } from './types';
import { createInvoiceHTML } from './template';
import { getArtifactStorage } from '@/lib/artifacts/storage';

// In-memory storage (should use database in production)
const invoicesDb: Record<string, Invoice> = {};

export class InvoiceService implements IInvoiceService {
  private readonly storage = getArtifactStorage();
  private readonly storagePrefix = process.env.INVOICE_STORAGE_PREFIX || 'invoices';
  private readonly emailOutboxPrefix =
    process.env.INVOICE_EMAIL_OUTBOX_PREFIX || 'artifacts/invoice-email';

  private invoicePath(invoiceId: string, filename: string): string {
    return `${this.storagePrefix}/${invoiceId}/${filename}`;
  }

  private emailOutboxPath(invoiceId: string, filename: string): string {
    return `${this.emailOutboxPrefix}/${invoiceId}/${filename}`;
  }

  private serializeInvoice(invoice: Invoice): Record<string, any> {
    return {
      ...invoice,
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : undefined,
      estimatedDelivery: invoice.estimatedDelivery
        ? invoice.estimatedDelivery.toISOString()
        : undefined,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
    };
  }

  private deserializeInvoice(raw: any): Invoice {
    return {
      ...raw,
      issueDate: new Date(raw.issueDate),
      dueDate: raw.dueDate ? new Date(raw.dueDate) : undefined,
      estimatedDelivery: raw.estimatedDelivery
        ? new Date(raw.estimatedDelivery)
        : undefined,
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt),
    };
  }

  private async loadInvoiceFromDisk(invoiceId: string): Promise<Invoice | null> {
    try {
      const json = await this.storage.readText(this.invoicePath(invoiceId, 'invoice.json'));
      const parsed = JSON.parse(json);
      return this.deserializeInvoice(parsed);
    } catch {
      return null;
    }
  }

  private escapePdfText(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  private htmlToPlainText(html: string): string {
    return html
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  private renderMinimalPdfFromText(text: string): Buffer {
    const source = text || 'Invoice';
    const maxLineLength = 100;
    const words = source.split(' ').filter(Boolean);
    const lines: string[] = [];
    let current = '';

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length > maxLineLength) {
        if (current) {
          lines.push(current);
        }
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) {
      lines.push(current);
    }

    const printableLines = (lines.length ? lines : ['Invoice']).slice(0, 55);
    const contentLines = [
      'BT',
      '/F1 11 Tf',
      '50 790 Td',
      ...printableLines.map((line, index) => {
        const escaped = this.escapePdfText(line);
        return index === 0 ? `(${escaped}) Tj` : `0 -14 Td (${escaped}) Tj`;
      }),
      'ET',
    ];
    const contentStream = contentLines.join('\n');

    const objects: string[] = [];
    objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
    objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
    objects.push(
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n'
    );
    objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');
    objects.push(
      `5 0 obj\n<< /Length ${Buffer.byteLength(contentStream, 'utf8')} >>\nstream\n${contentStream}\nendstream\nendobj\n`
    );

    let output = '%PDF-1.4\n';
    const offsets: number[] = [0];
    for (const obj of objects) {
      offsets.push(Buffer.byteLength(output, 'utf8'));
      output += obj;
    }

    const xrefStart = Buffer.byteLength(output, 'utf8');
    output += `xref\n0 ${objects.length + 1}\n`;
    output += '0000000000 65535 f \n';
    for (let i = 1; i <= objects.length; i += 1) {
      output += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }
    output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

    return Buffer.from(output, 'utf8');
  }

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

    const plainText = this.htmlToPlainText(html);
    return this.renderMinimalPdfFromText(
      `${filename ? `${filename} ` : ''}${plainText}`.trim()
    );
  }

  async saveInvoice(invoice: Invoice, artifacts?: { html?: string; pdf?: Buffer }): Promise<void> {
    invoicesDb[invoice.id] = {
      ...invoice,
      updatedAt: new Date(),
    };

    const persisted = invoicesDb[invoice.id];
    await this.storage.writeText(
      this.invoicePath(invoice.id, 'invoice.json'),
      JSON.stringify(this.serializeInvoice(persisted), null, 2)
    );

    if (artifacts?.html) {
      await this.storage.writeText(this.invoicePath(invoice.id, 'invoice.html'), artifacts.html);
    }

    if (artifacts?.pdf) {
      await this.storage.writeBuffer(
        this.invoicePath(invoice.id, 'invoice.pdf'),
        new Uint8Array(artifacts.pdf)
      );
    }
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    const invoice = invoicesDb[invoiceId] || (await this.loadInvoiceFromDisk(invoiceId));
    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }
    invoicesDb[invoiceId] = invoice;
    return invoice;
  }

  async listInvoices(customerId: string): Promise<Invoice[]> {
    const invoiceIds = await this.storage.listDirectories(this.storagePrefix);
    for (const invoiceId of invoiceIds) {
      if (!invoicesDb[invoiceId]) {
        const loaded = await this.loadInvoiceFromDisk(invoiceId);
        if (loaded) {
          invoicesDb[invoiceId] = loaded;
        }
      }
    }

    return Object.values(invoicesDb).filter((inv) =>
      inv.customerEmail?.includes(customerId) ||
      inv.orderId?.includes(customerId)
    );
  }

  async emailInvoice(invoice: Invoice, to: string, message?: string): Promise<void> {
    const provider = (process.env.INVOICE_EMAIL_PROVIDER || 'log').trim().toLowerCase();
    const subject = `Invoice ${invoice.invoiceNumber}`;
    const bodyMessage = message || 'Please find your invoice attached.';

    const recordAttempt = async (
      status: 'queued' | 'sent' | 'failed',
      details?: Record<string, unknown>
    ) => {
      await this.storage.writeText(
        this.emailOutboxPath(invoice.id, 'latest.json'),
        JSON.stringify(
          {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            to,
            subject,
            provider,
            status,
            message: bodyMessage,
            at: new Date().toISOString(),
            ...details,
          },
          null,
          2
        )
      );
    };

    try {
      const html = await this.renderHTML(invoice);

      await recordAttempt('queued');

      if (provider === 'resend') {
        const apiKey = process.env.RESEND_API_KEY;
        const from = process.env.EMAIL_FROM;

        if (!apiKey || !from) {
          throw new Error('INVOICE_EMAIL_PROVIDER=resend requires RESEND_API_KEY and EMAIL_FROM');
        }

        const pdf = await this.downloadPDF(invoice.id);
        const payload = {
          from,
          to,
          subject,
          html,
          text: bodyMessage,
          attachments: [
            {
              filename: `${invoice.invoiceNumber}.pdf`,
              content: pdf.toString('base64'),
            },
          ],
        };

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          throw new Error(`Resend email failed: ${response.status} ${errText}`);
        }

        const result = await response.json().catch(() => ({}));
        await recordAttempt('sent', { providerMessageId: result?.id || null });
        return;
      }

      // Fallback provider persists outbox/audit entry without external send.
      console.log(`[Invoice Email] Queued ${invoice.invoiceNumber} for ${to} using provider=${provider}`);
      await recordAttempt('sent', { mode: 'logged-only' });
    } catch (error: any) {
      await recordAttempt('failed', {
        error: error?.message || 'Unknown error',
      }).catch(() => {
        // Ignore outbox logging failure to preserve original error path.
      });
      console.error('Email send error:', error);
      throw error;
    }
  }

  async downloadPDF(invoiceId: string): Promise<Buffer> {
    const invoice = await this.getInvoice(invoiceId);

    try {
      const persistedPdf = await this.storage.readBuffer(this.invoicePath(invoiceId, 'invoice.pdf'));
      return Buffer.from(persistedPdf);
    } catch {
      // Fall back to on-the-fly generation when persistent artifact is missing.
    }

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
