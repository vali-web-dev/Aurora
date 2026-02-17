'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/ui/Button';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { AuroraDataService } from '@/data/types';
import { useCartStore, type CartLine } from '@/lib/commerce/cart-store';
import { buildTextReceipt, buildHtmlReceipt } from '@/components/commerce/ReceiptTemplate';
import type { Order } from '@/data/types';

const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const statusVariant = (status: string) => {
  switch (status) {
    case 'processing':
      return 'info';
    case 'shipped':
      return 'warning';
    case 'delivered':
      return 'default';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const shippingWindows: Record<string, { min: number; max: number }> = {
  amazon: { min: 2, max: 4 },
  shopify: { min: 3, max: 6 },
  etsy: { min: 4, max: 8 },
  walmart: { min: 3, max: 5 },
  bestbuy: { min: 2, max: 5 },
};

const getShippingWindow = (providerId: string) =>
  shippingWindows[providerId] ?? { min: 3, max: 7 };

const getDeliveryWindow = (lines: CartLine[]) => {
  if (lines.length === 0) return null;
  return lines.reduce(
    (acc, line) => {
      const window = getShippingWindow(line.product.providerId);
      return {
        min: Math.min(acc.min, window.min),
        max: Math.max(acc.max, window.max),
      };
    },
    { min: Number.POSITIVE_INFINITY, max: 0 }
  );
};

const trackingSteps = [
  { title: 'Order confirmed', detail: 'Payment verified and order created.' },
  { title: 'Packed', detail: 'Items are being prepared by providers.' },
  { title: 'In transit', detail: 'Shipment is on the way to your address.' },
  { title: 'Out for delivery', detail: 'Carrier is delivering today.' },
  { title: 'Delivered', detail: 'Package delivered to your doorstep.' },
];

const formatProvider = (providerId: string) =>
  providerId.charAt(0).toUpperCase() + providerId.slice(1);

export function OrderDetailPage({ orderId }: { orderId: string }) {
  const router = useRouter();
  const order = AuroraDataService.getOrderById(orderId);
  const products = AuroraDataService.getProducts();
  const productLookup = new Map(products.map((product) => [product.id, product]));
  const { addItems } = useCartStore();

  if (!order) {
    return (
      <Surface className="py-8">
        <SurfaceHeader
          title="Order Not Found"
          description="We could not locate that order in the mock history."
          actions={
            <Link href="/commerce/orders">
              <Button variant="secondary">Back to Orders</Button>
            </Link>
          }
        />
        <Card>
          <p className="aurora-label text-slate-600 dark:text-slate-400">
            Check the order id or return to order history.
          </p>
        </Card>
      </Surface>
    );
  }

  const orderLines: CartLine[] = order.cartItems
    .map((item) => {
      const product = productLookup.get(item.productId);
      if (!product) return null;
      return { product, quantity: item.quantity };
    })
    .filter((line): line is CartLine => Boolean(line));

  const deliveryWindow = getDeliveryWindow(orderLines);
  const providerReceipts = orderLines.reduce<Record<string, { items: CartLine[]; total: number }>>(
    (acc, line) => {
      const key = line.product.providerId;
      if (!acc[key]) {
        acc[key] = { items: [], total: 0 };
      }
      acc[key].items.push(line);
      acc[key].total += line.product.priceCents * line.quantity;
      return acc;
    },
    {}
  );

  const buildReceiptText = () => {
    return buildTextReceipt(order, productLookup);
  };

  const handleDownloadReceipt = () => {
    const content = buildReceiptText();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aurora-receipt-${order.invoiceNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handlePrintReceipt = () => {
    const htmlContent = buildHtmlReceipt(order, productLookup);
    const popup = window.open('', 'aurora-receipt', 'width=900,height=1000');
    if (!popup) return;
    popup.document.write(htmlContent);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  return (
    <Surface className="py-8">
      <SurfaceHeader
        title={`Order ${order.id}`}
        description={`Placed ${formatDate(order.createdAt)} • Invoice ${order.invoiceNumber} • Status: ${order.status}`}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/commerce/orders">
              <Button variant="secondary">Back to Orders</Button>
            </Link>
            <Button variant="outline" onClick={handleDownloadReceipt}>
              Download Receipt
            </Button>
            <Button variant="outline" onClick={handlePrintReceipt}>
              Print Receipt
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                addItems(orderLines);
                router.push('/commerce/cart');
              }}
            >
              Reorder
            </Button>
          </div>
        }
      />

      <SurfaceSection title="Summary">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge size="sm" variant={statusVariant(order.status)}>
              {order.status}
            </Badge>
            <Badge size="sm" variant="default">Total {formatMoney(order.totalCents)}</Badge>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="aurora-label aurora-text-xs text-slate-500 dark:text-slate-400">Items</p>
              <p className="aurora-label text-lg font-semibold text-slate-900 dark:text-slate-50">
                {orderLines.length}
              </p>
            </div>
            <div>
              <p className="aurora-label aurora-text-xs text-slate-500 dark:text-slate-400">Delivery window</p>
              <p className="aurora-label text-lg font-semibold text-slate-900 dark:text-slate-50">
                {deliveryWindow ? `${deliveryWindow.min}-${deliveryWindow.max} days` : 'TBD'}
              </p>
            </div>
            <div>
              <p className="aurora-label aurora-text-xs text-slate-500 dark:text-slate-400">Providers</p>
              <p className="aurora-label text-lg font-semibold text-slate-900 dark:text-slate-50">
                {Object.keys(providerReceipts).length}
              </p>
            </div>
          </div>
        </Card>
      </SurfaceSection>

      <SurfaceSection title="Items">
        <Card className="space-y-3">
          {orderLines.map((line) => (
            <div key={line.product.id} className="flex justify-between text-sm">
              <span className="aurora-label text-slate-600 dark:text-slate-400">
                {line.product.title} • {line.quantity}x
              </span>
              <span className="aurora-label text-slate-900 dark:text-slate-50">
                {formatMoney(line.product.priceCents * line.quantity)}
              </span>
            </div>
          ))}
        </Card>
      </SurfaceSection>

      <SurfaceSection title="Provider Receipts">
        <div className="space-y-4">
          {Object.entries(providerReceipts).map(([providerId, receipt]) => (
            <Card key={providerId} className="space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle>{formatProvider(providerId)}</CardTitle>
                <Badge size="sm" variant="default">{formatMoney(receipt.total)}</Badge>
              </div>
              <div className="space-y-2 text-sm">
                {receipt.items.map((line) => (
                  <div key={line.product.id} className="flex justify-between">
                    <span className="aurora-label text-slate-600 dark:text-slate-400">
                      {line.product.title} • {line.quantity}x
                    </span>
                    <span className="aurora-label text-slate-900 dark:text-slate-50">
                      {formatMoney(line.product.priceCents * line.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </SurfaceSection>

      <SurfaceSection title="Delivery Tracking">
        <Card className="space-y-3">
          {trackingSteps.map((step, index) => {
            const status = index === 0 ? 'complete' : index === 1 ? 'active' : 'pending';
            return (
              <div key={step.title} className="flex items-start gap-3">
                <span
                  className={`mt-1 h-2.5 w-2.5 rounded-full ${
                    status === 'complete'
                      ? 'bg-emerald-500'
                      : status === 'active'
                      ? 'bg-blue-500 animate-pulse transform-gpu'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                />
                <div>
                  <p className="aurora-label text-slate-900 dark:text-slate-50">
                    {step.title}
                  </p>
                  <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                    {step.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </Card>
      </SurfaceSection>
    </Surface>
  );
}
