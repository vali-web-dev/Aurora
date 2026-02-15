import { useSyncExternalStore } from 'react';
import type { Order } from '@/data/types';

const STORAGE_KEY = 'aurora-commerce-orders';

let orderState: Order[] = [];
let orderSnapshotCache: {
  orders: Order[];
  orderCount: number;
  pendingCount: number;
} = {
  orders: [],
  orderCount: 0,
  pendingCount: 0,
};
let initialized = false;
const listeners = new Set<() => void>();

const buildSnapshot = (orders: Order[]) => {
  const sorted = [...orders].sort((a, b) => {
    const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
    const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
    return timeB - timeA;
  });
  const pending = orders.filter((order) => order.status === 'processing' || order.status === 'shipped').length;
  orderSnapshotCache = {
    orders: sorted,
    orderCount: orders.length,
    pendingCount: pending,
  };
};

const notify = () => {
  buildSnapshot(orderState);
  listeners.forEach((listener) => listener());
};

const persist = () => {
  if (typeof window === 'undefined') return;
  try {
    // Store with dates as ISO strings for serialization
    const serializable = orderState.map((order) => ({
      ...order,
      createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
      invoiceDate: order.invoiceDate instanceof Date ? order.invoiceDate.toISOString() : order.invoiceDate,
      shipmentDate: order.shipmentDate instanceof Date ? order.shipmentDate.toISOString() : order.shipmentDate,
    }));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // Ignore storage failures
  }
};

const load = (): Order[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Convert ISO strings back to Date objects with validation
    return parsed.map((order: any) => {
      try {
        return {
          ...order,
          createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
          invoiceDate: order.invoiceDate ? new Date(order.invoiceDate) : new Date(),
          shipmentDate: order.shipmentDate ? new Date(order.shipmentDate) : new Date(),
        };
      } catch {
        // If any order is malformed, skip it
        return null;
      }
    }).filter((order): order is Order => order !== null);
  } catch (error) {
    console.error('Error loading orders from storage:', error);
    return [];
  }
};

const ensureInit = () => {
  if (initialized) return;
  try {
    orderState = load();
    buildSnapshot(orderState);
    initialized = true;
  } catch (error) {
    console.error('Failed to load orders from storage:', error);
    orderState = [];
    buildSnapshot(orderState);
    initialized = true;
    // Clear corrupted data
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
  }
};

export const orderStore = {
  getOrders: (): Order[] => {
    ensureInit();
    try {
      return orderSnapshotCache.orders;
    } catch {
      return [];
    }
  },

  getOrderById: (id: string): Order | null => {
    ensureInit();
    try {
      return orderState.find((order) => order.id === id) || null;
    } catch {
      return null;
    }
  },

  getRecentOrders: (limit: number = 5): Order[] => {
    ensureInit();
    try {
      return orderSnapshotCache.orders.slice(0, limit);
    } catch {
      return [];
    }
  },

  getOrderCount: (): number => {
    ensureInit();
    try {
      return orderSnapshotCache.orderCount;
    } catch {
      return 0;
    }
  },

  getPendingOrdersCount: (): number => {
    ensureInit();
    try {
      return orderSnapshotCache.pendingCount;
    } catch {
      return 0;
    }
  },

  addOrder: (order: Order): Order => {
    ensureInit();
    orderState = [order, ...orderState];
    persist();
    notify();
    return order;
  },

  updateOrderStatus: (id: string, status: Order['status']): boolean => {
    ensureInit();
    const index = orderState.findIndex((order) => order.id === id);
    if (index === -1) return false;

    orderState[index] = {
      ...orderState[index],
      status,
    };

    orderState = [...orderState];
    persist();
    notify();
    return true;
  },

  clearAllOrders: () => {
    ensureInit();
    orderState = [];
    persist();
    notify();
  },

  // Debug/recovery method
  resetStore: () => {
    orderState = [];
    initialized = false;
    buildSnapshot(orderState);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
  },

  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export const useOrderStore = () => {
  const orders = useSyncExternalStore(
    orderStore.subscribe,
    () => orderStore.getOrders(),
    () => []
  );

  const orderCount = useSyncExternalStore(
    orderStore.subscribe,
    () => orderStore.getOrderCount(),
    () => 0
  );

  const pendingCount = useSyncExternalStore(
    orderStore.subscribe,
    () => orderStore.getPendingOrdersCount(),
    () => 0
  );

  return {
    orders,
    orderCount,
    pendingCount,
    getOrderById: orderStore.getOrderById,
    getRecentOrders: orderStore.getRecentOrders,
    addOrder: orderStore.addOrder,
    updateOrderStatus: orderStore.updateOrderStatus,
    clearAllOrders: orderStore.clearAllOrders,
    resetStore: orderStore.resetStore,
  };
};

// Debug helper for browser console
if (typeof window !== 'undefined') {
  (window as any).auroraResetOrders = () => {
    orderStore.resetStore();
    console.log('Order store reset successfully. Refresh the page.');
  };
}
