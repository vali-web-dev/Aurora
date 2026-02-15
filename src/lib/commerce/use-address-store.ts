import { useSyncExternalStore } from 'react';
import { addressStore, type SavedAddress } from './address-store';
import type { Address } from '@/data/types';

// Re-export SavedAddress type
export type { SavedAddress };

export const useAddressStore = () => {
  const addresses = useSyncExternalStore(
    (listener) => addressStore.subscribe(listener),
    () => addressStore.getSavedAddresses(),
    () => addressStore.getSavedAddresses()
  );

  return {
    addresses,
    addAddress: (address: Address, label: string, isDefault?: boolean) =>
      addressStore.addAddress(address, label, isDefault),
    updateAddress: (id: string, updates: Partial<SavedAddress>) =>
      addressStore.updateAddress(id, updates),
    deleteAddress: (id: string) => addressStore.deleteAddress(id),
    getDefaultAddress: () => addressStore.getDefaultAddress(),
    setDefaultAddress: (id: string) => addressStore.setDefaultAddress(id),
  };
};
