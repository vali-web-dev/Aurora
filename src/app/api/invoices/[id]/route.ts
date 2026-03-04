/**
 * Invoice Detail Routes
 * GET /api/invoices/[id]/html - View invoice as HTML
 * GET /api/invoices/[id]/download - Download invoice as PDF
 */

import { NextRequest, NextResponse } from 'next/server';
import invoiceService from '@/lib/invoicing/service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const segment = new URL(req.url).pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'Invoice ID required' },
        { status: 400 }
      );
    }

    const invoice = await invoiceService.getInvoice(id);

    if (segment === 'html') {
      // Return HTML view
      const html = await invoiceService.renderHTML(invoice);
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="${invoice.invoiceNumber}.html"`,
        },
      });
    }

    if (segment === 'download') {
      // Return PDF download
      const pdf = await invoiceService.downloadPDF(id);
      return new NextResponse(pdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
          'Cache-Control': 'public, max-age=86400', // 24 hours
        },
      });
    }

    // Return JSON invoice details
    return NextResponse.json({
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        orderId: invoice.orderId,
        total: invoice.total,
        currency: invoice.currency,
        issueDate: invoice.issueDate,
        paymentStatus: invoice.paymentStatus,
        downloadUrl: invoiceService.getDownloadUrl(invoice.id),
      },
    });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    console.error('Invoice retrieval error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
