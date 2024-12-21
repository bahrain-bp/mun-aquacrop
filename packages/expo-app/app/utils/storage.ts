// app/utils/storage.ts
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isSecureStoreAvailable = async () => {
  if (Platform.OS !== 'web') {
    return await SecureStore.isAvailableAsync();
  }
  return false; // SecureStore is not available on the web
};

export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    const secureStoreAvailable = await isSecureStoreAvailable();
    if (secureStoreAvailable) {
      return await SecureStore.getItemAsync(key);
    } else {
      return localStorage.getItem(key); // Fallback for web
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    const secureStoreAvailable = await isSecureStoreAvailable();
    if (secureStoreAvailable) {
      await SecureStore.setItemAsync(key, value);
    } else {
      localStorage.setItem(key, value); // Fallback for web
    }
  },
  removeItem: async (key: string): Promise<void> => {
    const secureStoreAvailable = await isSecureStoreAvailable();
    if (secureStoreAvailable) {
      await SecureStore.deleteItemAsync(key);
    } else {
      localStorage.removeItem(key); // Fallback for web
    }
  },
};
