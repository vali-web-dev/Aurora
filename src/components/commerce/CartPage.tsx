'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/aurora/Button';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { InlineNotice } from '@/components/ui/InlineNotice';
import { useCartStore } from '@/lib/commerce/cart-store';
import { useProfileStore } from '@/lib/commerce/profile-store';
import { useOrderStore } from '@/lib/commerce/order-store';
import type { Product } from '@/data/types';

const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const formatProvider = (providerId: string) =>
  providerId.charAt(0).toUpperCase() + providerId.slice(1);

const shippingWindows: Record<string, { min: number; max: number }> = {
  amazon: { min: 2, max: 4 },
  shopify: { min: 3, max: 6 },
  etsy: { min: 4, max: 8 },
  walmart: { min: 3, max: 5 },
  bestbuy: { min: 2, max: 5 },
};

const getShippingWindow = (providerId: string) =>
  shippingWindows[providerId] ?? { min: 3, max: 7 };

const calculateDeliveryWindow = (items: Array<{ product: { providerId: string } }>): { min: number; max: number } => {
  if (items.length === 0) {
    return { min: Number.POSITIVE_INFINITY, max: 0 };
  }
  return items.reduce<{ min: number; max: number }>(
    (acc: { min: number; max: number }, line: { product: { providerId: string } }) => {
      const window = getShippingWindow(line.product.providerId);
      return {
        min: Math.min(acc.min, window.min),
        max: Math.max(acc.max, window.max),
      };
    },
    { min: Number.POSITIVE_INFINITY, max: 0 }
  );
};

export function CartPage() {
  const router = useRouter();
  const { profile } = useProfileStore();
  const { orderCount } = useOrderStore();
  const [notice, setNotice] = useState<{ message: string; tone: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const {
    items,
    savedItems,
    itemCount,
    subtotal,
    tax,
    total,
    updateQuantity,
    removeItem,
    clearCart,
    saveForLater,
    moveToCart,
    removeSaved,
  } = useCartStore();

  const confirmAction = (message: string) => window.confirm(message);

  const pushNotice = (message: string, tone: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setNotice({ message, tone });
    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setNotice(null);
    }, 2400);
  };

  useEffect(() => {
    if (!profile) {
      router.replace('/commerce/delivery');
    }
  }, [profile, router]);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current !== null) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const deliveryWindow = calculateDeliveryWindow(items);

  return (
    <Surface className="py-8">
      <SurfaceHeader
        title="Cart"
        description="Review quantities, totals, and keep the cart aligned before checkout."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Badge size="sm" variant={itemCount > 0 ? 'info' : 'default'}>
              Items: {itemCount}
            </Badge>
            {orderCount > 0 && (
              <Link href="/commerce/orders">
                <Button variant="ghost">
                  View Orders ({orderCount})
                </Button>
              </Link>
            )}
            {items.length > 0 && (
              <Button
                variant="ghost"
                onClick={() => {
                  if (confirmAction('Clear all items from your cart?')) {
                    clearCart();
                    pushNotice('Cart cleared.', 'success');
                  } else {
                    pushNotice('Cart clear canceled.', 'info');
                  }
                }}
              >
                Clear Cart
              </Button>
            )}
            <Link href="/commerce">
              <Button variant="secondary">Continue Shopping</Button>
            </Link>
          </div>
        }
      />

      {notice && (
        <div className="mb-6">
          <InlineNotice message={notice.message} tone={notice.tone} />
        </div>
      )}

      <SurfaceSection title="Cart Items">
        <Card className="space-y-4">
          {items.length === 0 ? (
            <div className="space-y-3">
              <p className="text-slate-600 dark:text-slate-400">
                Your cart is empty. Add items from Commerce to begin.
              </p>
              <Link href="/commerce">
                <Button variant="primary">Browse Products</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4" role="list" aria-label="Cart items">
              {items.map((line: { product: Product; quantity: number }) => {
                const lineTotal = line.product.priceCents * line.quantity;
                return (
                  <div
                    key={line.product.id}
                    role="listitem"
                    className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={line.product.imageUrl}
                        alt={line.product.title}
                        className="h-16 w-16 rounded-lg object-cover bg-slate-100 dark:bg-slate-800"
                      />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                          {line.product.title}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {formatProvider(line.product.providerId)} • {formatMoney(line.product.priceCents)}
                          {` • Est ${getShippingWindow(line.product.providerId).min}-${getShippingWindow(line.product.providerId).max} days`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label={`Decrease quantity of ${line.product.title}`}
                          onClick={() => {
                            updateQuantity(line.product.id, line.quantity - 1);
                            pushNotice('Quantity updated.', 'success');
                          }}
                        >
                          -
                        </Button>
                        <span className="min-w-[2rem] text-center text-sm font-semibold text-slate-900 dark:text-slate-50">
                          {line.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label={`Increase quantity of ${line.product.title}`}
                          onClick={() => {
                            updateQuantity(line.product.id, line.quantity + 1);
                            pushNotice('Quantity updated.', 'success');
                          }}
                        >
                          +
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Line total</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                          {formatMoney(lineTotal)}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Save ${line.product.title} for later`}
                        onClick={() => {
                          if (confirmAction(`Move ${line.product.title} to Saved for later?`)) {
                            saveForLater(line.product.id);
                            pushNotice(`${line.product.title} saved for later.`, 'success');
                          } else {
                            pushNotice('Save for later canceled.', 'info');
                          }
                        }}
                      >
                        Save for later
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Remove ${line.product.title} from cart`}
                        onClick={() => {
                          if (confirmAction(`Remove ${line.product.title} from your cart?`)) {
                            removeItem(line.product.id);
                            pushNotice(`${line.product.title} removed from cart.`, 'success');
                          } else {
                            pushNotice('Remove canceled.', 'info');
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </SurfaceSection>

      <div id="saved" className="scroll-mt-24">
        <SurfaceSection title="Saved for Later" description="Keep future picks here until you are ready.">
          <Card className="space-y-4 saved-highlight">
            {savedItems.length === 0 ? (
              <p className="text-slate-600 dark:text-slate-400">
                No saved items yet.
              </p>
            ) : (
              <div className="space-y-4" role="list" aria-label="Saved items">
                {savedItems.map((line: { product: Product; quantity: number }) => (
                  <div
                    key={line.product.id}
                    role="listitem"
                    className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={line.product.imageUrl}
                        alt={line.product.title}
                        className="h-14 w-14 rounded-lg object-cover bg-slate-100 dark:bg-slate-800"
                      />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                          {line.product.title}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {formatProvider(line.product.providerId)} • {formatMoney(line.product.priceCents)}
                          {line.quantity > 1 ? ` • ${line.quantity}x` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirmAction(`Move ${line.product.title} back to cart?`)) {
                            moveToCart(line.product.id);
                            pushNotice(`${line.product.title} moved to cart.`, 'success');
                          } else {
                            pushNotice('Move to cart canceled.', 'info');
                          }
                        }}
                      >
                        Move to cart
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirmAction(`Remove ${line.product.title} from saved items?`)) {
                            removeSaved(line.product.id);
                            pushNotice(`${line.product.title} removed from saved.`, 'success');
                          } else {
                            pushNotice('Remove canceled.', 'info');
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </SurfaceSection>
      </div>

      <SurfaceSection title="Summary">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardTitle>Order Summary</CardTitle>
            <div className="mt-4 space-y-3 text-sm">
              {items.length > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Delivery window</span>
                  <span>{deliveryWindow.min}-{deliveryWindow.max} days</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Estimated tax</span>
                <span>{formatMoney(tax)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-slate-900 dark:text-slate-50">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>
          </Card>

          <Card className="space-y-3">
            <CardTitle>Next Step</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Review your cart priorities before checkout.
            </p>
            <Link href="/commerce/review">
              <Button variant="aurora" className="w-full" disabled={items.length === 0}>
                Review Cart
              </Button>
            </Link>
            <Link href="/commerce/checkout">
              <Button variant="auroraSecondary" className="w-full" disabled={items.length === 0}>
                Proceed to Checkout
              </Button>
            </Link>
          </Card>
        </div>
      </SurfaceSection>
    </Surface>
  );
}
