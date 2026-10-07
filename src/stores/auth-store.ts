import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

const TOKEN_KEY = 'kega_token';

interface AuthState {
  token: string | null;
  status: 'hydrating' | 'ready';
  hydrate: () => Promise<void>;
  setToken: (token: string) => Promise<void>;
  clear: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  status: 'hydrating',

  hydrate: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY).catch(() => null);
    set({ token, status: 'ready' });
  },

  setToken: async (token) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    set({ token });
  },

  clear: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    set({ token: null });
  },
}));
