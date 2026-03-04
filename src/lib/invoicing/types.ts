/**
 * Invoice Generator Type Definitions
 */

export interface InvoiceLineItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate?: Date;
  
  // Customer details
  customerName: string;
  customerEmail: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };

  // Items
  lineItems: InvoiceLineItem[];
  
  // Totals
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;

  // Payment details
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  transactionId?: string;

  // Fulfillment
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: Date;

  // Notes
  notes?: string;
  terms?: string;

  // Document
  pdfUrl?: string;
  htmlUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceTemplate {
  name: string;
  content: string;  // HTML template
  variables: string[];  // Template variables
}

/**
 * Invoice Service Interface
 */
export interface IInvoiceService {
  /**
   * Generate invoice from order
   */
  generateFromOrder(orderId: string, orderData: any): Promise<Invoice>;

  /**
   * Render invoice as HTML
   */
  renderHTML(invoice: Invoice, template?: InvoiceTemplate): Promise<string>;

  /**
   * Generate PDF from HTML
   */
  renderPDF(html: string, filename?: string): Promise<Buffer>;

  /**
   * Save invoice
   */
  saveInvoice(invoice: Invoice): Promise<void>;

  /**
   * Retrieve invoice
   */
  getInvoice(invoiceId: string): Promise<Invoice>;

  /**
   * List invoices for a customer
   */
  listInvoices(customerId: string): Promise<Invoice[]>;

  /**
   * Email invoice to customer
   */
  emailInvoice(invoice: Invoice, to: string, message?: string): Promise<void>;

  /**
   * Download invoice PDF
   */
  downloadPDF(invoiceId: string): Promise<Buffer>;

  /**
   * Get invoice download URL
   */
  getDownloadUrl(invoiceId: string): string;
}
