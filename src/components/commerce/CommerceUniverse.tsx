'use client';

import { useState } from 'react';
import { Card } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';
import { ProductCard } from '@/components/commerce/ProductCard';
import { AuroraDataService, type Product } from '@/data/types';

const products = AuroraDataService.getProducts();

const formatProvider = (providerId: string) =>
  providerId.charAt(0).toUpperCase() + providerId.slice(1);

export function CommerceUniverse() {
  const [cart, setCart] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);

  const handleAddToCart = (product: Product) => {
    setCart([...cart, product]);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.priceCents, 0);
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + tax;

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-50">
          Commerce Universe
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl">
          Shop everything from the world's best providers in one unified experience.
        </p>
      </div>

      {/* Browse section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Featured Products
          </h2>
          <Button
            variant={showCart ? 'primary' : 'secondary'}
            onClick={() => setShowCart(!showCart)}
          >
            🛒 Cart ({cart.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>

      {/* Cart sidebar */}
      {showCart && (
        <Card className="bg-blue-50 dark:bg-slate-900 border-blue-200 dark:border-slate-800">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
              Shopping Cart
            </h3>

            {cart.length === 0 ? (
              <p className="text-slate-600 dark:text-slate-400">
                Your cart is empty. Add items to get started!
              </p>
            ) : (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg"
                    >
                      <div className="flex-grow">
                        <p className="font-medium text-slate-900 dark:text-slate-50 truncate">
                          {item.title}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          ${(item.priceCents / 100).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 font-bold ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-300 dark:border-slate-700 pt-3 space-y-2">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal:</span>
                    <span>${(subtotal / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Tax (8%):</span>
                    <span>${(tax / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-slate-50">
                    <span>Total:</span>
                    <span>${(total / 100).toFixed(2)}</span>
                  </div>
                </div>

                <Button variant="primary" size="lg" className="w-full">
                  Proceed to Checkout
                </Button>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Providers section */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            Integrated Providers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Amazon', 'Shopify', 'eBay', 'Walmart', 'Etsy', 'AliExpress', 'Temu', 'Cosco'].map(
              (provider) => (
                <div
                  key={provider}
                  className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center font-medium text-slate-900 dark:text-slate-50"
                >
                  {provider}
                </div>
              )
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
