/**
 * Invoices API Route
 * POST /api/invoices - Generate invoice from order
 * GET /api/invoices - List invoices
 */

import { NextRequest, NextResponse } from 'next/server';
import invoiceService from '@/lib/invoicing/service';

export async function POST(req: NextRequest) {
  try {
    const { orderId, orderData } = await req.json();

    if (!orderId || !orderData) {
      return NextResponse.json(
        { error: 'Order ID and order data required' },
        { status: 400 }
      );
    }

    const invoice = await invoiceService.generateFromOrder(orderId, orderData);

    // Generate HTML
    const html = await invoiceService.renderHTML(invoice);

    // TODO: Save PDF to storage
    invoice.htmlUrl = `/api/invoices/${invoice.id}/html`;
    invoice.pdfUrl = `/api/invoices/${invoice.id}/download`;

    await invoiceService.saveInvoice(invoice);

    // Send email if email provided
    if (orderData.customerEmail) {
      invoiceService.emailInvoice(invoice, orderData.customerEmail, 'Your order invoice is attached').catch(err => {
        console.error('Failed to send invoice email:', err);
      });
    }

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        orderId: invoice.orderId,
        total: invoice.total,
        currency: invoice.currency,
        issueDate: invoice.issueDate,
        downloadUrl: invoiceService.getDownloadUrl(invoice.id),
        viewUrl: `/api/invoices/${invoice.id}/html`,
      },
    });
  } catch (error: any) {
    console.error('Invoice generation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID required' },
        { status: 400 }
      );
    }

    const invoices = await invoiceService.listInvoices(customerId);

    return NextResponse.json({
      invoices: invoices.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        total: inv.total,
        currency: inv.currency,
        issueDate: inv.issueDate,
        paymentStatus: inv.paymentStatus,
        downloadUrl: invoiceService.getDownloadUrl(inv.id),
      })),
    });
  } catch (error: any) {
    console.error('List invoices error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
