import { useSyncExternalStore } from 'react';
import type { Product } from '@/data/types';

export type CartLine = {
  product: Product;
  quantity: number;
};

type CartListener = () => void;

type CartSnapshot = CartLine[];

const STORAGE_KEY = 'aurora-commerce-cart';

let cartState: CartLine[] = [];
let initialized = false;
const listeners = new Set<CartListener>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const persist = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartState));
  } catch {
    // Ignore storage failures.
  }
};

const load = (): CartLine[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((line) => line && line.product && typeof line.quantity === 'number');
  } catch {
    return [];
  }
};

const ensureInit = () => {
  if (initialized) return;
  cartState = load();
  initialized = true;
};

const getSnapshot = (): CartSnapshot => {
  ensureInit();
  return cartState;
};

const getServerSnapshot = (): CartSnapshot => [];

const subscribe = (listener: CartListener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const setCartState = (next: CartLine[]) => {
  cartState = next;
  persist();
  notify();
};

export const addItem = (product: Product) => {
  ensureInit();
  const existing = cartState.find((line) => line.product.id === product.id);
  if (existing) {
    setCartState(
      cartState.map((line) =>
        line.product.id === product.id
          ? { ...line, quantity: line.quantity + 1 }
          : line
      )
    );
    return;
  }
  setCartState([...cartState, { product, quantity: 1 }]);
};

export const removeItem = (productId: string) => {
  ensureInit();
  setCartState(cartState.filter((line) => line.product.id !== productId));
};

export const updateQuantity = (productId: string, quantity: number) => {
  ensureInit();
  if (quantity <= 0) {
    removeItem(productId);
    return;
  }
  setCartState(
    cartState.map((line) =>
      line.product.id === productId ? { ...line, quantity } : line
    )
  );
};

export const clearCart = () => {
  ensureInit();
  setCartState([]);
};

export function useCartStore() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const itemCount = items.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = items.reduce(
    (sum, line) => sum + line.product.priceCents * line.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + tax;

  return {
    items,
    itemCount,
    subtotal,
    tax,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
