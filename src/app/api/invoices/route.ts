/**
 * Invoices API Route
 * POST /api/invoices - Generate invoice from order
 * GET /api/invoices - List invoices
 */

import { NextRequest } from 'next/server';
import invoiceService from '@/lib/invoicing/service';
import { withApiTrace } from '@/lib/api-trace';
import {
  errorResponse,
  successResponse,
  validateQuery,
  validateRequestBody,
} from '@/lib/request-validation';
import { invoiceCreateSchema, invoicesListQuerySchema } from '@/lib/validations';
import type { z } from 'zod';

type InvoiceCreatePayload = z.infer<typeof invoiceCreateSchema>;
type InvoicesListQuery = z.infer<typeof invoicesListQuerySchema>;

const postInvoiceHandler = async (req: NextRequest) => {
  try {
    const validation = await validateRequestBody(req, invoiceCreateSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { orderId, orderData } = validation.data as InvoiceCreatePayload;

    const invoice = await invoiceService.generateFromOrder(orderId, orderData);

    // Generate HTML
    const html = await invoiceService.renderHTML(invoice);
    const pdf = await invoiceService.renderPDF(html, `${invoice.invoiceNumber}.pdf`);

    invoice.htmlUrl = `/api/invoices/${invoice.id}/html`;
    invoice.pdfUrl = `/api/invoices/${invoice.id}/download`;

    await invoiceService.saveInvoice(invoice, { html, pdf });

    // Send email if email provided
    if (orderData.customerEmail) {
      invoiceService.emailInvoice(invoice, orderData.customerEmail, 'Your order invoice is attached').catch(err => {
        console.error('Failed to send invoice email:', err);
      });
    }

    return successResponse({
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
  } catch (error: unknown) {
    console.error('Invoice generation error:', error);
    return errorResponse('Failed to generate invoice', 500);
  }
};

export const POST = withApiTrace('/api/invoices', async (req, _context) =>
  postInvoiceHandler(req)
);

const getInvoicesHandler = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const queryValidation = validateQuery<InvoicesListQuery>(
      searchParams,
      invoicesListQuerySchema
    );

    if (!queryValidation.success) {
      return errorResponse(queryValidation.error, 400);
    }

    const { customerId } = queryValidation.data;

    const invoices = await invoiceService.listInvoices(customerId);

    return successResponse({
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
  } catch (error: unknown) {
    console.error('List invoices error:', error);
    return errorResponse('Failed to list invoices', 500);
  }
};

export const GET = withApiTrace('/api/invoices', async (req, _context) =>
  getInvoicesHandler(req)
);
