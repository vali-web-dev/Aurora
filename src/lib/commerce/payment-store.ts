import { useSyncExternalStore } from 'react';

export type PaymentMethodType = 'card' | 'wallet' | 'bank';

export type SavedPaymentMethod = {
  id: string;
  type: PaymentMethodType;
  label: string; // "Personal Visa", "Business Card", etc.
  isDefault: boolean;
  
  // Card details (for type: 'card')
  cardLast4?: string;
  cardBrand?: string; // visa, mastercard, amex, etc.
  cardExpiry?: string; // MM/YY format
  
  // Wallet details (for type: 'wallet')
  walletProvider?: string; // aurora, paypal, etc.
  walletEmail?: string;
  
  // Bank details (for type: 'bank')
  bankName?: string;
  bankAccountLast4?: string;
  
  // Billing address reference
  billingAddressId?: string; // Links to saved address
  
  // Metadata
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'aurora-commerce-payments';

let paymentState: SavedPaymentMethod[] = [];
let initialized = false;
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const persist = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(paymentState));
  } catch {
    // Ignore storage failures
  }
};

const load = (): SavedPaymentMethod[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

const ensureInit = () => {
  if (initialized) return;
  paymentState = load();
  initialized = true;
};

export const paymentStore = {
  getPayments: (): SavedPaymentMethod[] => {
    ensureInit();
    return paymentState;
  },

  getDefaultPayment: (): SavedPaymentMethod | null => {
    ensureInit();
    return paymentState.find((p) => p.isDefault) || paymentState[0] || null;
  },

  getPaymentById: (id: string): SavedPaymentMethod | null => {
    ensureInit();
    return paymentState.find((p) => p.id === id) || null;
  },

  addPayment: (
    payment: Omit<SavedPaymentMethod, 'id' | 'createdAt' | 'updatedAt'>,
    makeDefault = false
  ): SavedPaymentMethod => {
    ensureInit();
    
    const now = new Date().toISOString();
    const newPayment: SavedPaymentMethod = {
      ...payment,
      id: `payment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      isDefault: makeDefault || paymentState.length === 0,
      createdAt: now,
      updatedAt: now,
    };

    // If this is the new default, unset others
    if (newPayment.isDefault) {
      paymentState = paymentState.map((p) => ({ ...p, isDefault: false }));
    }

    paymentState = [...paymentState, newPayment];
    persist();
    notify();
    return newPayment;
  },

  updatePayment: (id: string, updates: Partial<SavedPaymentMethod>): boolean => {
    ensureInit();
    const index = paymentState.findIndex((p) => p.id === id);
    if (index === -1) return false;

    // If setting as default, unset others
    if (updates.isDefault) {
      paymentState = paymentState.map((p) => ({ ...p, isDefault: false }));
    }

    paymentState[index] = {
      ...paymentState[index],
      ...updates,
      id: paymentState[index].id, // Preserve ID
      createdAt: paymentState[index].createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };

    paymentState = [...paymentState];
    persist();
    notify();
    return true;
  },

  setDefaultPayment: (id: string): boolean => {
    ensureInit();
    const exists = paymentState.some((p) => p.id === id);
    if (!exists) return false;

    paymentState = paymentState.map((p) => ({
      ...p,
      isDefault: p.id === id,
    }));

    persist();
    notify();
    return true;
  },

  removePayment: (id: string): boolean => {
    ensureInit();
    const index = paymentState.findIndex((p) => p.id === id);
    if (index === -1) return false;

    const wasDefault = paymentState[index].isDefault;
    paymentState = paymentState.filter((p) => p.id !== id);

    // If we removed the default and there are others, make the first one default
    if (wasDefault && paymentState.length > 0) {
      paymentState[0].isDefault = true;
    }

    persist();
    notify();
    return true;
  },

  clearAllPayments: () => {
    ensureInit();
    paymentState = [];
    persist();
    notify();
  },

  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export const usePaymentStore = () => {
  const payments = useSyncExternalStore(
    paymentStore.subscribe,
    () => paymentStore.getPayments(),
    () => []
  );

  return {
    payments,
    getDefaultPayment: paymentStore.getDefaultPayment,
    getPaymentById: paymentStore.getPaymentById,
    addPayment: paymentStore.addPayment,
    updatePayment: paymentStore.updatePayment,
    setDefaultPayment: paymentStore.setDefaultPayment,
    removePayment: paymentStore.removePayment,
    clearAllPayments: paymentStore.clearAllPayments,
  };
};
