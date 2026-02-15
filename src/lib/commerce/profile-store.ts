import { useSyncExternalStore } from 'react';

export type CustomerProfile = {
  fullName: string;
  email: string;
  phone: string;
  defaultPaymentMethod: 'card' | 'wallet' | 'bank';
  updatedAt: string;
};

const STORAGE_KEY = 'aurora-commerce-profile';

let profileState: CustomerProfile | null = null;
let initialized = false;
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const persist = () => {
  if (typeof window === 'undefined') return;
  try {
    if (profileState) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profileState));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures.
  }
};

const load = (): CustomerProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.fullName || !parsed.email || !parsed.phone) return null;
    return parsed as CustomerProfile;
  } catch {
    return null;
  }
};

const ensureInit = () => {
  if (initialized) return;
  profileState = load();
  initialized = true;
};

export const profileStore = {
  getProfile: (): CustomerProfile | null => {
    ensureInit();
    return profileState;
  },

  setProfile: (profile: CustomerProfile) => {
    ensureInit();
    profileState = profile;
    persist();
    notify();
  },

  clearProfile: () => {
    ensureInit();
    profileState = null;
    persist();
    notify();
  },

  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export const useProfileStore = () => {
  const profile = useSyncExternalStore(
    (listener) => profileStore.subscribe(listener),
    () => profileStore.getProfile(),
    () => profileStore.getProfile()
  );

  return {
    profile,
    setProfile: (profile: CustomerProfile) => profileStore.setProfile(profile),
    clearProfile: () => profileStore.clearProfile(),
  };
};
