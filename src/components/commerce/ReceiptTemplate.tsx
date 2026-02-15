'use client';

import type { Order, OrderItem, Address } from '@/data/types';
import type { Product } from '@/data/types';

interface ReceiptTemplateProps {
  order: Order;
  products: Map<string, Product>;
  format?: 'text' | 'html';
}

const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const formatAddress = (addr: Address) =>
  `${addr.name}\n${addr.street}\n${addr.city}, ${addr.province} ${addr.zip}\n${addr.country}`;

const buildTextReceipt = (order: Order, products: Map<string, Product>): string => {
  const lines: string[] = [];

  // Header
  lines.push('═'.repeat(70));
  lines.push('Aurora Commerce - Invoice / Receipt'.padEnd(70));
  lines.push('═'.repeat(70));
  lines.push('');

  // Status and totals
  lines.push(`Status: ${order.status.toUpperCase().padEnd(30)} Total: ${formatMoney(order.totalCents)}`);
  lines.push(`Invoice #: ${order.invoiceNumber.padEnd(28)} Order #: ${order.id}`);
  lines.push('');

  // Dates
  lines.push(`Invoice Date: ${formatDate(order.invoiceDate).padEnd(24)} Shipment Date: ${formatDate(order.shipmentDate)}`);
  lines.push(`Shipment #: ${order.shipmentNumber}`);
  lines.push('');

  // Addresses
  lines.push('BILLING ADDRESS'.padEnd(35) + 'SHIPPING ADDRESS');
  lines.push('─'.repeat(70));
  const billingLines = formatAddress(order.billingAddress).split('\n');
  const shippingLines = formatAddress(order.shippingAddress).split('\n');
  const maxLines = Math.max(billingLines.length, shippingLines.length);
  for (let i = 0; i < maxLines; i++) {
    const billing = (billingLines[i] || '').padEnd(35);
    const shipping = shippingLines[i] || '';
    lines.push(billing + shipping);
  }
  lines.push('');

  // Line items
  lines.push('ITEMS');
  lines.push('─'.repeat(70));
  const itemsByProvider = new Map<string, OrderItem[]>();
  order.cartItems.forEach((item) => {
    const key = item.sellerId;
    if (!itemsByProvider.has(key)) {
      itemsByProvider.set(key, []);
    }
    itemsByProvider.get(key)!.push(item);
  });

  let itemTotal = 0;
  itemsByProvider.forEach((items, sellerId) => {
    lines.push(`Sold by: ${items[0].sellerName}`);
    items.forEach((item) => {
      const product = products.get(item.productId);
      const linePrice = item.unitPriceCents * item.quantity;
      itemTotal += linePrice;
      const title = product?.title || `Product ${item.productId}`;
      lines.push(`  ${title}`);
      lines.push(
        `    Qty: ${item.quantity.toString().padStart(2)} × ${formatMoney(item.unitPriceCents).padStart(8)} = ${formatMoney(linePrice).padStart(10)}`
      );
      if (item.asin) {
        lines.push(`    ASIN: ${item.asin}`);
      }
    });
    lines.push('');
  });

  // Financial breakdown
  lines.push('FINANCIAL SUMMARY');
  lines.push('─'.repeat(70));
  lines.push(`Item Subtotal (excl. tax)`.padEnd(40) + formatMoney(order.subtotalCents).padStart(15));
  if (order.shippingCostCents > 0) {
    lines.push(
      `Shipping Charges`.padEnd(40) +
        formatMoney(order.shippingCostCents).padStart(15)
    );
  }
  if (order.discountCents > 0) {
    lines.push(
      `Discount`.padEnd(40) +
        `-${formatMoney(order.discountCents)}`.padStart(14)
    );
  }
  if (order.shippingDiscount > 0) {
    lines.push(
      `Shipping Discount`.padEnd(40) +
        `-${formatMoney(order.shippingDiscount)}`.padStart(14)
    );
  }
  lines.push('─'.repeat(70));
  lines.push(
    `Subtotal After Discounts`.padEnd(40) +
      formatMoney(order.subtotalCents - order.discountCents).padStart(15)
  );
  lines.push('');

  // Tax breakdown
  lines.push('TAXES');
  lines.push('─'.repeat(70));
  if (order.taxFederalCents > 0) {
    lines.push(
      `Federal Tax (GST/HST)`.padEnd(40) +
        formatMoney(order.taxFederalCents).padStart(15)
    );
  }
  if (order.taxProvincialCents > 0) {
    lines.push(
      `Provincial Tax (PST/RST/QST)`.padEnd(40) +
        formatMoney(order.taxProvincialCents).padStart(15)
    );
  }
  const totalTax = order.taxFederalCents + order.taxProvincialCents;
  lines.push(
    `Tax Subtotal`.padEnd(40) +
      formatMoney(totalTax).padStart(15)
  );
  lines.push('');

  // Total
  lines.push('═'.repeat(70));
  lines.push(`TOTAL PAYABLE`.padEnd(40) + formatMoney(order.totalCents).padStart(15));
  lines.push('═'.repeat(70));
  lines.push('');

  // Payment and support
  lines.push(`Payment Method: ${order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}`);
  lines.push('');
  lines.push('For order inquiries:');
  lines.push('Phone: 1-877-586-3230');
  lines.push('Web: www.aurora.ai/contact-us');
  lines.push('');
  lines.push('═'.repeat(70));

  return lines.join('\n');
};

const buildHtmlReceipt = (order: Order, products: Map<string, Product>): string => {
  const itemsByProvider = new Map<string, OrderItem[]>();
  order.cartItems.forEach((item) => {
    const key = item.sellerId;
    if (!itemsByProvider.has(key)) {
      itemsByProvider.set(key, []);
    }
    itemsByProvider.get(key)!.push(item);
  });

  const totalTax = order.taxFederalCents + order.taxProvincialCents;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Aurora Receipt ${order.invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            padding: 20px;
            color: #0f172a;
          }
          .receipt {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border: 1px solid #e2e8f0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .header {
            padding: 24px;
            border-bottom: 2px solid #0f172a;
            background: #f1f5f9;
          }
          .header h1 {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 4px;
          }
          .header-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-top: 16px;
            font-size: 13px;
          }
          .header-col {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .header-label {
            font-weight: 600;
            color: #475569;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
          }
          .header-value {
            font-size: 14px;
            color: #0f172a;
          }
          .section {
            padding: 24px;
            border-bottom: 1px solid #e2e8f0;
          }
          .section-title {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #475569;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid #cbd5e1;
          }
          .address-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 16px;
          }
          .address-block {
            font-size: 13px;
            line-height: 1.6;
            color: #334155;
          }
          .address-heading {
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #0f172a;
            margin-bottom: 8px;
          }
          .provider-section {
            margin-bottom: 20px;
            padding: 16px;
            background: #f8fafc;
            border-left: 3px solid #3b82f6;
          }
          .provider-name {
            font-weight: 600;
            color: #0f172a;
            font-size: 14px;
            margin-bottom: 12px;
          }
          .item {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 16px;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #e2e8f0;
          }
          .item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          .item-details {
            font-size: 13px;
          }
          .item-title {
            font-weight: 500;
            color: #0f172a;
            margin-bottom: 4px;
          }
          .item-meta {
            font-size: 12px;
            color: #64748b;
          }
          .item-price {
            text-align: right;
            font-weight: 600;
            color: #0f172a;
            font-size: 14px;
          }
          .financial-table {
            width: 100%;
            margin-bottom: 16px;
          }
          .financial-row {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 16px;
            padding: 8px 0;
            font-size: 13px;
            border-bottom: 1px solid #e2e8f0;
          }
          .financial-row.subtotal {
            font-weight: 500;
            border-bottom: 2px solid #cbd5e1;
          }
          .financial-row.total {
            font-weight: 700;
            font-size: 15px;
            padding: 12px 0;
            border-bottom: none;
          }
          .financial-label {
            color: #334155;
          }
          .financial-value {
            text-align: right;
            color: #0f172a;
            font-weight: 600;
          }
          .financial-row.total .financial-value {
            font-size: 16px;
          }
          .footer {
            padding: 24px;
            background: #f8fafc;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            line-height: 1.6;
          }
          .footer-link {
            color: #3b82f6;
            text-decoration: none;
          }
          @media print {
            body { background: white; padding: 0; }
            .receipt { border: none; box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>Aurora Commerce Receipt</h1>
            <div class="header-row">
              <div class="header-col">
                <span class="header-label">Status</span>
                <span class="header-value">${order.status.toUpperCase()}</span>
              </div>
              <div class="header-col">
                <span class="header-label">Total</span>
                <span class="header-value">${formatMoney(order.totalCents)}</span>
              </div>
            </div>
            <div class="header-row">
              <div class="header-col">
                <span class="header-label">Invoice #</span>
                <span class="header-value">${order.invoiceNumber}</span>
              </div>
              <div class="header-col">
                <span class="header-label">Order #</span>
                <span class="header-value">${order.id}</span>
              </div>
            </div>
            <div class="header-row">
              <div class="header-col">
                <span class="header-label">Invoice Date</span>
                <span class="header-value">${formatDate(order.invoiceDate)}</span>
              </div>
              <div class="header-col">
                <span class="header-label">Shipment #</span>
                <span class="header-value">${order.shipmentNumber}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Addresses</div>
            <div class="address-grid">
              <div>
                <div class="address-heading">Billing Address</div>
                <div class="address-block">
                  ${order.billingAddress.name}<br/>
                  ${order.billingAddress.street}<br/>
                  ${order.billingAddress.city}, ${order.billingAddress.province} ${order.billingAddress.zip}<br/>
                  ${order.billingAddress.country}
                </div>
              </div>
              <div>
                <div class="address-heading">Shipping Address</div>
                <div class="address-block">
                  ${order.shippingAddress.name}<br/>
                  ${order.shippingAddress.street}<br/>
                  ${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.zip}<br/>
                  ${order.shippingAddress.country}
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Items</div>
            ${Array.from(itemsByProvider.entries())
              .map(
                ([sellerId, items]) => `
              <div class="provider-section">
                <div class="provider-name">Sold by: ${items[0].sellerName}</div>
                ${items
                  .map((item) => {
                    const product = products.get(item.productId);
                    const linePrice = item.unitPriceCents * item.quantity;
                    return `
                  <div class="item">
                    <div class="item-details">
                      <div class="item-title">${product?.title || `Product ${item.productId}`}</div>
                      <div class="item-meta">
                        Quantity: ${item.quantity} × ${formatMoney(item.unitPriceCents)}
                        ${item.asin ? `<br/>ASIN: ${item.asin}` : ''}
                      </div>
                    </div>
                    <div class="item-price">${formatMoney(linePrice)}</div>
                  </div>
                `;
                  })
                  .join('')}
              </div>
            `
              )
              .join('')}
          </div>

          <div class="section">
            <div class="section-title">Financial Summary</div>
            <div class="financial-table">
              <div class="financial-row">
                <div class="financial-label">Item Subtotal (excl. tax)</div>
                <div class="financial-value">${formatMoney(order.subtotalCents)}</div>
              </div>
              ${
                order.shippingCostCents > 0
                  ? `
                <div class="financial-row">
                  <div class="financial-label">Shipping Charges</div>
                  <div class="financial-value">${formatMoney(order.shippingCostCents)}</div>
                </div>
              `
                  : ''
              }
              ${
                order.discountCents > 0
                  ? `
                <div class="financial-row">
                  <div class="financial-label">Discount</div>
                  <div class="financial-value">-${formatMoney(order.discountCents)}</div>
                </div>
              `
                  : ''
              }
              ${
                order.shippingDiscount > 0
                  ? `
                <div class="financial-row">
                  <div class="financial-label">Shipping Discount</div>
                  <div class="financial-value">-${formatMoney(order.shippingDiscount)}</div>
                </div>
              `
                  : ''
              }
              <div class="financial-row subtotal">
                <div class="financial-label">Subtotal After Discounts</div>
                <div class="financial-value">${formatMoney(order.subtotalCents - order.discountCents)}</div>
              </div>
            </div>

            <div class="section-title">Taxes</div>
            <div class="financial-table">
              ${
                order.taxFederalCents > 0
                  ? `
                <div class="financial-row">
                  <div class="financial-label">Federal Tax (GST/HST)</div>
                  <div class="financial-value">${formatMoney(order.taxFederalCents)}</div>
                </div>
              `
                  : ''
              }
              ${
                order.taxProvincialCents > 0
                  ? `
                <div class="financial-row">
                  <div class="financial-label">Provincial Tax (PST/RST/QST)</div>
                  <div class="financial-value">${formatMoney(order.taxProvincialCents)}</div>
                </div>
              `
                  : ''
              }
              <div class="financial-row subtotal">
                <div class="financial-label">Tax Subtotal</div>
                <div class="financial-value">${formatMoney(totalTax)}</div>
              </div>
              <div class="financial-row total">
                <div class="financial-label">Total Payable</div>
                <div class="financial-value">${formatMoney(order.totalCents)}</div>
              </div>
            </div>
          </div>

          <div class="footer">
            <p><strong>Payment Method:</strong> ${order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}</p>
            <p style="margin-top: 12px;">
              For order inquiries:<br/>
              Phone: <strong>1-877-586-3230</strong><br/>
              Web: <a href="https://www.aurora.ai/contact-us" class="footer-link">www.aurora.ai/contact-us</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export function ReceiptTemplate({ order, products, format = 'html' }: ReceiptTemplateProps) {
  if (format === 'text') {
    return buildTextReceipt(order, products);
  }
  return buildHtmlReceipt(order, products);
}

export { buildTextReceipt, buildHtmlReceipt };
