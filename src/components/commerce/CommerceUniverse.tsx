'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Card, CardTitle } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { ProductCard } from '@/components/commerce/ProductCard';
import { InlineNotice } from '@/components/ui/InlineNotice';
import { AuroraDataService, type Product } from '@/data/types';
import { useCartStore } from '@/lib/commerce/cart-store';
import { useOrderStore } from '@/lib/commerce/order-store';
import { LifeModal } from '@/components/aurora/LifeModal';

const products = AuroraDataService.getProducts();

const formatProvider = (providerId: string) =>
  providerId.charAt(0).toUpperCase() + providerId.slice(1);

const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export function CommerceUniverse() {
  const { itemCount, savedCount, total, addItem } = useCartStore();
  const { orderCount, pendingCount } = useOrderStore();
  const [cartNotice, setCartNotice] = useState<{ message: string; tone: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [isLifeOpen, setIsLifeOpen] = useState(false);
  const noticeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setIsLifeOpen(true);
    return () => {
      if (noticeTimerRef.current !== null) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem(product);
    setCartNotice({ message: `${product.title} added to cart.`, tone: 'success' });
    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setCartNotice(null);
    }, 2200);
  };

  return (
    <Surface className="py-8">
      <LifeModal
        isOpen={isLifeOpen}
        onClose={() => setIsLifeOpen(false)}
        state="active"
        title="Life"
        description="Commerce vitality online"
      />
      <SurfaceHeader
        title="Commerce Universe"
        description="Shop everything from the world's best providers in one unified experience."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col leading-tight">
                <span className="aurora-label text-xs text-slate-500 dark:text-slate-400">Cart total</span>
                <span className="aurora-label font-semibold text-slate-900 dark:text-slate-50">
                  {formatMoney(total)}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex flex-col leading-tight">
                <span className="aurora-label text-xs text-slate-500 dark:text-slate-400">Items</span>
                <span className="aurora-label font-semibold text-slate-900 dark:text-slate-50">
                  {itemCount}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
              <Link href="/commerce/cart#saved" className="flex flex-col leading-tight">
                <span className="aurora-label text-xs text-slate-500 dark:text-slate-400">Saved</span>
                <span className="aurora-label font-semibold text-slate-900 dark:text-slate-50">
                  {savedCount}
                </span>
              </Link>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
              <Link href="/commerce/orders" className="flex flex-col leading-tight">
                <span className="aurora-label text-xs text-slate-500 dark:text-slate-400">Orders</span>
                <span className="aurora-label font-semibold text-slate-900 dark:text-slate-50">
                  {orderCount}
                  {pendingCount > 0 && (
                    <span className="aurora-label ml-1 text-xs text-blue-600 dark:text-blue-400">
                      ({pendingCount})
                    </span>
                  )}
                </span>
              </Link>
              <Link href="/commerce/cart">
                <Button size="sm" variant="secondary">View</Button>
              </Link>
              <Link href="/commerce/checkout">
                <Button size="sm" variant="primary" disabled={itemCount === 0}>
                  Checkout
                </Button>
              </Link>
            </div>
          </div>
        }
      />

      {cartNotice && (
        <div className="mb-6">
          <InlineNotice message={cartNotice.message} tone={cartNotice.tone} />
        </div>
      )}

      <SurfaceSection title="Featured Products">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Featured products">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              title={product.title}
              priceCents={product.priceCents}
              imageUrl={product.imageUrl}
              provider={formatProvider(product.providerId)}
              rating={product.rating}
              onAddToCart={() => handleAddToCart(product)}
            />
          ))}
        </div>
      </SurfaceSection>

      <SurfaceSection title="Integrated Providers">
        <Card>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="list" aria-label="Integrated providers">
              {['Amazon', 'Shopify', 'eBay', 'Walmart', 'Etsy', 'AliExpress', 'Temu', 'Cosco'].map(
                (provider) => (
                  <div
                    key={provider}
                    role="listitem"
                    className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center font-medium aurora-label text-slate-900 dark:text-slate-50"
                  >
                    {provider}
                  </div>
                )
              )}
            </div>
          </div>
        </Card>
      </SurfaceSection>
    </Surface>
  );
}
