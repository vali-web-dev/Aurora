'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/aurora/Button';
import { Select } from '@/components/aurora/Form';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { AuroraDataService, type Order } from '@/data/types';
import { useCartStore, type CartLine } from '@/lib/commerce/cart-store';
import { useOrderStore } from '@/lib/commerce/order-store';
import { buildTextReceipt } from '@/components/commerce/ReceiptTemplate';

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

export function OrderHistoryPage() {
  const router = useRouter();
  const { orders: storedOrders, orderCount } = useOrderStore();
  const products = AuroraDataService.getProducts();
  const orders = storedOrders.length > 0 ? storedOrders : AuroraDataService.getOrders();
  const productLookup = new Map(products.map((product) => [product.id, product]));
  const { addItems } = useCartStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredOrders = useMemo(() => {
    const next = statusFilter === 'all'
      ? orders
      : orders.filter((order) => order.status === statusFilter);

    return [...next].sort((a, b) => {
      if (sortBy === 'oldest') {
        return a.createdAt.getTime() - b.createdAt.getTime();
      }
      if (sortBy === 'total-high') {
        return b.totalCents - a.totalCents;
      }
      if (sortBy === 'total-low') {
        return a.totalCents - b.totalCents;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }, [orders, sortBy, statusFilter]);

  return (
    <Surface className="py-8">
      <SurfaceHeader
        title="Order History"
        description="Track recent purchases, delivery status, and totals across providers."
        actions={
          <Link href="/commerce">
            <Button variant="secondary">Continue Shopping</Button>
          </Link>
        }
      />

      <SurfaceSection
        title="Recent Orders"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Select
              label="Status"
              className="min-w-[160px]"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              options={[
                { value: 'all', label: 'All statuses' },
                { value: 'processing', label: 'Processing' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
            <Select
              label="Sort"
              className="min-w-[170px]"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              options={[
                { value: 'newest', label: 'Newest first' },
                { value: 'oldest', label: 'Oldest first' },
                { value: 'total-high', label: 'Total high to low' },
                { value: 'total-low', label: 'Total low to high' },
              ]}
            />
          </div>
        }
      >
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <p className="aurora-label text-slate-600 dark:text-slate-400">
                No orders yet. Your mock purchases will appear here after checkout.
              </p>
            </Card>
          ) : (
            filteredOrders.map((order) => {
              const orderItems = order.cartItems
                .map((item) => ({
                  item,
                  product: productLookup.get(item.productId),
                }))
                .filter((entry) => entry.product);

              const reorderLines: CartLine[] = orderItems.map(({ item, product }) => ({
                product: product!,
                quantity: item.quantity,
              }));

              const handleDownloadReceipt = () => {
                const content = buildTextReceipt(order, productLookup);
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

              return (
                <Card key={order.id} className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle>Order {order.id}</CardTitle>
                      <p className="aurora-label aurora-text-xs text-slate-600 dark:text-slate-400">
                        Invoice {order.invoiceNumber} • Placed {formatDate(order.createdAt)} • {orderItems.length} items
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge size="sm" variant={statusVariant(order.status)}>
                        {order.status}
                      </Badge>
                      <Badge size="sm" variant="default">
                        Total {formatMoney(order.totalCents)}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {orderItems.map(({ item, product }) => (
                      <div key={product?.id} className="flex justify-between">
                        <span className="aurora-label text-slate-600 dark:text-slate-400">
                          {product?.title} • {item.quantity}x
                        </span>
                        <span className="aurora-label text-slate-900 dark:text-slate-50">
                          {formatMoney((product?.priceCents ?? 0) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link href={`/commerce/orders/${order.id}`}>
                      <Button size="sm" variant="outline">View Details</Button>
                    </Link>
                    <Button size="sm" variant="ghost" onClick={handleDownloadReceipt}>
                      Download Receipt
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        addItems(reorderLines);
                        router.push('/commerce/cart');
                      }}
                    >
                      Reorder
                    </Button>
                    <Link href="/commerce/review">
                      <Button size="sm" variant="ghost">Review Priorities</Button>
                    </Link>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </SurfaceSection>
    </Surface>
  );
}
