import type { Address } from '@/data/types';

const STORAGE_KEY = 'aurora-commerce-addresses';

export interface SavedAddress extends Address {
  id: string;
  label: string;
  isDefault?: boolean;
}

let savedAddresses: SavedAddress[] = [];
let snapshotCache: SavedAddress[] = [];
let initialized = false;
const listeners = new Set<() => void>();

const notify = () => {
  // Update snapshot cache when notifying
  snapshotCache = [...savedAddresses];
  listeners.forEach((listener) => listener());
};

const persist = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedAddresses));
  } catch {
    // Ignore storage failures.
  }
};

const load = (): SavedAddress[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (addr) =>
        addr &&
        addr.id &&
        addr.label &&
        addr.name &&
        addr.street &&
        addr.city &&
        addr.province &&
        addr.zip &&
        addr.country
    );
  } catch {
    return [];
  }
};

const ensureInit = () => {
  if (initialized) return;
  savedAddresses = load();
  snapshotCache = [...savedAddresses];
  initialized = true;
};

export const addressStore = {
  getSavedAddresses: (): SavedAddress[] => {
    ensureInit();
    return snapshotCache;
  },

  addAddress: (address: Address, label: string, isDefault = false): SavedAddress => {
    ensureInit();
    const id = `addr-${Date.now().toString(36).toUpperCase()}`;
    const newAddress: SavedAddress = {
      ...address,
      id,
      label,
      isDefault: isDefault || savedAddresses.length === 0,
    };
    savedAddresses.push(newAddress);
    persist();
    notify();
    return newAddress;
  },

  updateAddress: (id: string, updates: Partial<SavedAddress>): SavedAddress | null => {
    ensureInit();
    const addr = savedAddresses.find((a) => a.id === id);
    if (!addr) return null;
    Object.assign(addr, updates);
    persist();
    notify();
    return addr;
  },

  deleteAddress: (id: string): boolean => {
    ensureInit();
    const index = savedAddresses.findIndex((a) => a.id === id);
    if (index === -1) return false;
    savedAddresses.splice(index, 1);
    persist();
    notify();
    return true;
  },

  getDefaultAddress: (): SavedAddress | null => {
    ensureInit();
    return savedAddresses.find((a) => a.isDefault) || savedAddresses[0] || null;
  },

  setDefaultAddress: (id: string): boolean => {
    ensureInit();
    const addr = savedAddresses.find((a) => a.id === id);
    if (!addr) return false;
    savedAddresses.forEach((a) => (a.isDefault = a.id === id));
    persist();
    notify();
    return true;
  },

  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
