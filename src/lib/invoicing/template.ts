/**
 * Invoice HTML Template
 * Professional invoice template with CSS styling
 */

import { Invoice } from './types';

export function createInvoiceHTML(invoice: Invoice): string {
  const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 900px; margin: 0 auto; padding: 40px; }
    
    header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #1a73e8; }
    .invoice-header { text-align: right; }
    .invoice-header h1 { font-size: 32px; margin-bottom: 10px; }
    .invoice-header p { color: #666; }
    
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .detail-section h2 { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #999; margin-bottom: 10px; }
    .detail-section p { font-size: 14px; line-height: 1.8; }
    
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    thead { background-color: #f9f9f9; }
    th { padding: 12px; text-align: left; font-weight: 600; font-size: 13px; text-transform: uppercase; color: #666; border-bottom: 2px solid #e0e0e0; }
    td { padding: 15px 12px; border-bottom: 1px solid #f0f0f0; }
    tr:last-child td { border-bottom: none; }
    
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    
    .totals { margin-left: auto; width: 300px; }
    .total-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    .total-row.total-amount { font-weight: bold; font-size: 18px; border-bottom: 2px solid #1a73e8; border-top: 2px solid #1a73e8; padding: 15px 0; }
    
    .notes { background-color: #f9f9f9; padding: 20px; border-radius: 4px; margin-top: 30px; }
    .notes h3 { margin-bottom: 10px; }
    .notes p { font-size: 13px; color: #666; }
    
    footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999; text-align: center; }
    
    @media print {
      body { margin: 0; padding: 0; }
      .container { margin: 0; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">Aurora</div>
      <div class="invoice-header">
        <h1>Invoice</h1>
        <p>${invoice.invoiceNumber}</p>
      </div>
    </header>
    
    <div class="details-grid">
      <div>
        <div class="detail-section">
          <h2>Bill To</h2>
          <p>
            ${invoice.customerName}<br>
            ${invoice.billingAddress.street}<br>
            ${invoice.billingAddress.city}, ${invoice.billingAddress.state} ${invoice.billingAddress.zip}<br>
            ${invoice.billingAddress.country}
          </p>
        </div>
        ${invoice.shippingAddress ? `
        <div class="detail-section" style="margin-top: 20px;">
          <h2>Ship To</h2>
          <p>
            ${invoice.shippingAddress.street}<br>
            ${invoice.shippingAddress.city}, ${invoice.shippingAddress.state} ${invoice.shippingAddress.zip}<br>
            ${invoice.shippingAddress.country}
          </p>
        </div>
        ` : ''}
      </div>
      
      <div>
        <div class="detail-section">
          <h2>Invoice Details</h2>
          <p>
            <strong>Invoice Number:</strong> ${invoice.invoiceNumber}<br>
            <strong>Date:</strong> ${formatDate(invoice.issueDate)}<br>
            ${invoice.dueDate ? `<strong>Due Date:</strong> ${formatDate(invoice.dueDate)}<br>` : ''}
            <strong>Order ID:</strong> ${invoice.orderId}<br>
            ${invoice.trackingNumber ? `<strong>Tracking:</strong> ${invoice.trackingNumber} (${invoice.carrier || 'Unknown'})<br>` : ''}
            ${invoice.estimatedDelivery ? `<strong>Est. Delivery:</strong> ${formatDate(invoice.estimatedDelivery)}<br>` : ''}
          </p>
        </div>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="text-right">Quantity</th>
          <th class="text-right">Unit Price</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.lineItems.map(item => `
        <tr>
          <td>${item.productName}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${formatMoney(item.unitPrice)}</td>
          <td class="text-right">${formatMoney(item.total)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="totals">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>${formatMoney(invoice.subtotal)}</span>
      </div>
      ${invoice.shipping > 0 ? `
      <div class="total-row">
        <span>Shipping:</span>
        <span>${formatMoney(invoice.shipping)}</span>
      </div>
      ` : ''}
      ${invoice.discount > 0 ? `
      <div class="total-row">
        <span>Discount:</span>
        <span>-${formatMoney(invoice.discount)}</span>
      </div>
      ` : ''}
      <div class="total-row">
        <span>Tax:</span>
        <span>${formatMoney(invoice.tax)}</span>
      </div>
      <div class="total-row total-amount">
        <span>Total:</span>
        <span>${formatMoney(invoice.total)} ${invoice.currency}</span>
      </div>
    </div>
    
    ${invoice.notes ? `
    <div class="notes">
      <h3>Notes</h3>
      <p>${invoice.notes}</p>
    </div>
    ` : ''}
    
    <footer>
      <p>Thank you for your purchase! For questions, please contact support@aurora.app</p>
      <p>Invoice generated on ${formatDate(invoice.createdAt)}</p>
    </footer>
  </div>
</body>
</html>
  `;
}
