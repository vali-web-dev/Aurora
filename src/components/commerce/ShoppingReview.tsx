'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { AuroraDataService, type ShoppingItem, type Product } from '@/data/types';
import { Card, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/ui/Button';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { useCartStore, type CartLine } from '@/lib/commerce/cart-store';

const shoppingList = AuroraDataService.getShoppingList();
const products = AuroraDataService.getProducts();

const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const topPicks = [...products]
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 3);

const formatProvider = (providerId: string) =>
  providerId.charAt(0).toUpperCase() + providerId.slice(1);

type ReviewItem = {
  id: string;
  title: string;
  providerId: string;
  priceCents: number;
  priority: ShoppingItem['priority'];
  quantity?: number;
};

const getPriorityFromPrice = (priceCents: number, min: number, max: number) => {
  if (max === min) return 'medium';
  const step = (max - min) / 3;
  if (priceCents >= min + step * 2) return 'high';
  if (priceCents >= min + step) return 'medium';
  return 'low';
};

export function ShoppingReview() {
  const { items: cartItems } = useCartStore();
  const reviewItems = useMemo<ReviewItem[]>(() => {
    if (cartItems.length > 0) {
      const prices = cartItems.map((line: CartLine) => line.product.priceCents * line.quantity);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return cartItems.map((line: CartLine) => ({
        id: line.product.id,
        title: line.product.title,
        providerId: line.product.providerId,
        priceCents: line.product.priceCents * line.quantity,
        quantity: line.quantity,
        priority: getPriorityFromPrice(line.product.priceCents * line.quantity, min, max),
      }));
    }
    return shoppingList;
  }, [cartItems]);

  const providerTotals = useMemo(() => {
    return reviewItems.reduce<Record<string, { count: number; total: number }>>(
      (acc: Record<string, { count: number; total: number }>, item: ReviewItem) => {
        if (!acc[item.providerId]) {
          acc[item.providerId] = { count: 0, total: 0 };
        }
        acc[item.providerId].count += 1;
        acc[item.providerId].total += item.priceCents;
        return acc;
      },
      {}
    );
  }, [reviewItems]);

  const providerStats = useMemo(
    () =>
      (Object.entries(providerTotals) as [string, { count: number; total: number }][])
        .map(([providerId, stats]) => ({
          providerId,
          count: stats.count,
          total: stats.total,
        }))
        .sort((a, b) => b.total - a.total),
    [providerTotals]
  );

  const priorities = useMemo(
    () => ({
      high: reviewItems.filter((item: ReviewItem) => item.priority === 'high'),
      medium: reviewItems.filter((item: ReviewItem) => item.priority === 'medium'),
      low: reviewItems.filter((item: ReviewItem) => item.priority === 'low'),
    }),
    [reviewItems]
  );

  const totals = useMemo(() => {
    const totalCents = reviewItems.reduce((sum: number, item: ReviewItem) => sum + item.priceCents, 0);
    const prices = reviewItems.map((item: ReviewItem) => item.priceCents);
    const highestCents = prices.length ? Math.max(...prices) : 0;
    const lowestCents = prices.length ? Math.min(...prices) : 0;
    const averageCents = reviewItems.length ? Math.round(totalCents / reviewItems.length) : 0;

    return {
      items: reviewItems.length,
      high: priorities.high.length,
      medium: priorities.medium.length,
      low: priorities.low.length,
      totalCents,
      averageCents,
      highestCents,
      lowestCents,
    };
  }, [priorities, reviewItems]);

  const summaryLabel = cartItems.length > 0 ? 'Live cart review' : 'Shopping list review';

  return (
    <Surface className="py-8">
      <SurfaceHeader
        title="Shopping Review"
        description={`A focused review of what matters most: budget, priority, and the next best actions. ${summaryLabel}.`}
        actions={
          <>
            <Badge size="sm" variant={cartItems.length > 0 ? 'info' : 'default'}>
              Cart Sync: {cartItems.length > 0 ? 'Live' : 'Preview'}
            </Badge>
            <Link href="/commerce/cart">
              <Button variant="secondary">Back to Cart</Button>
            </Link>
            <Link href="/commerce/checkout">
              <Button variant="primary" disabled={cartItems.length === 0}>
                Proceed to Checkout
              </Button>
            </Link>
          </>
        }
      />

      <SurfaceSection title="Overview" description="Snapshot of spend, urgency, and provider spread.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950/40">
            <CardTitle>Total Spend</CardTitle>
            <p className="aurora-label text-3xl font-bold text-slate-900 dark:text-slate-50 mt-3">
              {formatMoney(totals.totalCents)}
            </p>
            <p className="aurora-label text-sm text-slate-600 dark:text-slate-400 mt-2">
              {totals.items} items • Avg {formatMoney(totals.averageCents)}
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-rose-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-950 dark:to-amber-950/30">
            <CardTitle>Priority Mix</CardTitle>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge size="sm" variant="error">High {totals.high}</Badge>
              <Badge size="sm" variant="warning">Medium {totals.medium}</Badge>
              <Badge size="sm" variant="default">Low {totals.low}</Badge>
            </div>
            <p className="aurora-label text-sm text-slate-600 dark:text-slate-400 mt-3">
              Focus on high priority items first to keep momentum.
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-emerald-950/30">
            <CardTitle>Provider Mix</CardTitle>
            <div className="mt-3 space-y-2">
              {providerStats.slice(0, 3).map((provider: { providerId: string; count: number; total: number }) => (
                <div key={provider.providerId} className="flex items-center justify-between text-sm">
                  <span className="aurora-label font-medium text-slate-900 dark:text-slate-50">
                    {formatProvider(provider.providerId)}
                  </span>
                  <span className="aurora-label text-slate-600 dark:text-slate-400">
                    {provider.count} • {formatMoney(provider.total)}
                  </span>
                </div>
              ))}
            </div>
            <p className="aurora-label text-sm text-slate-600 dark:text-slate-400 mt-3">
              Track concentration to avoid fragmented checkouts.
            </p>
          </Card>
        </div>
      </SurfaceSection>

      <SurfaceSection
        title="Priority Queue"
        description="High priority items that should move first."
        actions={
          <Link href="/commerce">
            <Button variant="ghost" size="sm">Open Cart</Button>
          </Link>
        }
      >
        <Card>
          {priorities.high.length === 0 ? (
            <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
              No high priority items right now. Add urgency tags to keep the list intentional.
            </p>
          ) : (
            <div className="space-y-3">
              {priorities.high.map((item: ReviewItem) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="aurora-label font-semibold text-slate-900 dark:text-slate-50">
                      {item.title}
                    </p>
                    <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                      {formatProvider(item.providerId)} • {formatMoney(item.priceCents)}
                      {item.quantity ? ` • ${item.quantity}x` : ''}
                    </p>
                  </div>
                  <Badge size="sm" variant="error">High Priority</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </SurfaceSection>

      <SurfaceSection title="Budget Signals" description="Quick checks to keep spend aligned.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardTitle>Highest Item</CardTitle>
            <p className="aurora-label text-2xl font-semibold text-slate-900 dark:text-slate-50 mt-3">
              {formatMoney(totals.highestCents)}
            </p>
            <p className="aurora-label text-sm text-slate-600 dark:text-slate-400 mt-2">
              Consider waiting for a price drop on big-ticket items.
            </p>
          </Card>
          <Card>
            <CardTitle>Lowest Item</CardTitle>
            <p className="aurora-label text-2xl font-semibold text-slate-900 dark:text-slate-50 mt-3">
              {formatMoney(totals.lowestCents)}
            </p>
            <p className="aurora-label text-sm text-slate-600 dark:text-slate-400 mt-2">
              Low-cost wins keep the list moving.
            </p>
          </Card>
          <Card>
            <CardTitle>Average Price</CardTitle>
            <p className="aurora-label text-2xl font-semibold text-slate-900 dark:text-slate-50 mt-3">
              {formatMoney(totals.averageCents)}
            </p>
            <p className="aurora-label text-sm text-slate-600 dark:text-slate-400 mt-2">
              Maintain balance between essentials and upgrades.
            </p>
          </Card>
        </div>
      </SurfaceSection>

      <SurfaceSection title="Next Best Picks" description="High-rated items that complement your list.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topPicks.map((product: Product) => (
            <Card key={product.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle>{product.title}</CardTitle>
                <Badge size="sm" variant="info">{product.rating.toFixed(1)}★</Badge>
              </div>
              <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
                {formatProvider(product.providerId)}
              </p>
              <p className="aurora-label text-2xl font-semibold text-slate-900 dark:text-slate-50">
                {formatMoney(product.priceCents)}
              </p>
              <Link href="/commerce">
                <Button variant="secondary" size="sm">View in Commerce</Button>
              </Link>
            </Card>
          ))}
        </div>
      </SurfaceSection>

      <SurfaceSection title="Next Steps">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="space-y-3">
            <CardTitle>Continue Shopping</CardTitle>
            <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
              Go back to your cart to adjust quantities or remove items.
            </p>
            <Link href="/commerce/cart">
              <Button variant="secondary" className="w-full">
                Back to Cart
              </Button>
            </Link>
          </Card>
          <Card className="space-y-3">
            <CardTitle>Ready to Purchase</CardTitle>
            <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
              {cartItems.length > 0
                ? 'Proceed to checkout and complete your order.'
                : 'Add items to your cart before checking out.'}
            </p>
            <Link href="/commerce/checkout">
              <Button variant="primary" className="w-full" disabled={cartItems.length === 0}>
                Proceed to Checkout
              </Button>
            </Link>
          </Card>
        </div>
      </SurfaceSection>
    </Surface>
  );
}
