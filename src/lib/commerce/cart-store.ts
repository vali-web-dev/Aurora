import { useSyncExternalStore } from 'react';
import type { Product } from '@/data/types';

export type CartLine = {
  product: Product;
  quantity: number;
};

type CartListener = () => void;

const STORAGE_KEY = 'aurora-commerce-cart';
const SAVED_KEY = 'aurora-commerce-saved';

let cartState: CartLine[] = [];
let savedState: CartLine[] = [];
let snapshotCache: { cart: CartLine[]; saved: CartLine[] } = { cart: cartState, saved: savedState };
let initialized = false;
const listeners = new Set<CartListener>();

const notify = () => {
  snapshotCache = { cart: cartState, saved: savedState };
  listeners.forEach((listener) => listener());
};

const persist = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartState));
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(savedState));
  } catch {
    // Ignore storage failures.
  }
};

const load = (key: string): CartLine[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
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
  cartState = load(STORAGE_KEY);
  savedState = load(SAVED_KEY);
  snapshotCache = { cart: cartState, saved: savedState };
  initialized = true;
};

type CartSnapshot = {
  cart: CartLine[];
  saved: CartLine[];
};

const getSnapshot = (): CartSnapshot => {
  ensureInit();
  return snapshotCache;
};

const getServerSnapshot = (): CartSnapshot => ({ cart: [], saved: [] });

const subscribe = (listener: CartListener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const setState = (nextCart: CartLine[], nextSaved: CartLine[] = savedState) => {
  cartState = nextCart;
  savedState = nextSaved;
  snapshotCache = { cart: cartState, saved: savedState };
  persist();
  notify();
};

const addToState = (state: CartLine[], product: Product, quantity = 1) => {
  const existing = state.find((line) => line.product.id === product.id);
  if (existing) {
    return state.map((line) =>
      line.product.id === product.id
        ? { ...line, quantity: line.quantity + quantity }
        : line
    );
  }
  return [...state, { product, quantity }];
};

export const addItem = (product: Product) => {
  ensureInit();
  setState(addToState(cartState, product, 1));
};

export const addItems = (lines: CartLine[]) => {
  ensureInit();
  if (lines.length === 0) return;
  let nextCart = cartState;
  lines.forEach((line) => {
    nextCart = addToState(nextCart, line.product, line.quantity);
  });
  setState(nextCart);
};

export const removeItem = (productId: string) => {
  ensureInit();
  setState(cartState.filter((line) => line.product.id !== productId));
};

export const updateQuantity = (productId: string, quantity: number) => {
  ensureInit();
  if (quantity <= 0) {
    removeItem(productId);
    return;
  }
  setState(
    cartState.map((line) =>
      line.product.id === productId ? { ...line, quantity } : line
    )
  );
};

export const clearCart = () => {
  ensureInit();
  setState([]);
};

export const saveForLater = (productId: string) => {
  ensureInit();
  const line = cartState.find((item) => item.product.id === productId);
  if (!line) return;
  const nextCart = cartState.filter((item) => item.product.id !== productId);
  const nextSaved = addToState(savedState, line.product, line.quantity);
  setState(nextCart, nextSaved);
};

export const moveToCart = (productId: string) => {
  ensureInit();
  const line = savedState.find((item) => item.product.id === productId);
  if (!line) return;
  const nextSaved = savedState.filter((item) => item.product.id !== productId);
  const nextCart = addToState(cartState, line.product, line.quantity);
  setState(nextCart, nextSaved);
};

export const removeSaved = (productId: string) => {
  ensureInit();
  setState(cartState, savedState.filter((item) => item.product.id !== productId));
};

export const clearSaved = () => {
  ensureInit();
  setState(cartState, []);
};

export function useCartStore() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const items = snapshot.cart;
  const savedItems = snapshot.saved;

  const itemCount = items.reduce((sum, line) => sum + line.quantity, 0);
  const savedCount = savedItems.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = items.reduce(
    (sum, line) => sum + line.product.priceCents * line.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + tax;

  return {
    items,
    savedItems,
    itemCount,
    savedCount,
    subtotal,
    tax,
    total,
    addItem,
    addItems,
    removeItem,
    updateQuantity,
    clearCart,
    saveForLater,
    moveToCart,
    removeSaved,
    clearSaved,
  };
}
