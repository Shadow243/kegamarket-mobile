import * as SecureStore from 'expo-secure-store';

import { useAuthStore } from './auth-store';

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    setItemAsync: jest.fn((key: string, value: string) => Promise.resolve(void store.set(key, value))),
    deleteItemAsync: jest.fn((key: string) => Promise.resolve(void store.delete(key))),
  };
});

describe('auth store', () => {
  beforeEach(() => useAuthStore.setState({ token: null, status: 'hydrating' }));

  it('is ready with no token on a fresh install', async () => {
    await useAuthStore.getState().hydrate();

    expect(useAuthStore.getState()).toMatchObject({ token: null, status: 'ready' });
  });

  it('keeps the token in secure storage across restarts', async () => {
    await useAuthStore.getState().setToken('abc');
    useAuthStore.setState({ token: null, status: 'hydrating' });

    await useAuthStore.getState().hydrate();

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('kega_token', 'abc');
    expect(useAuthStore.getState().token).toBe('abc');
  });

  it('forgets the token on clear', async () => {
    await useAuthStore.getState().setToken('abc');
    await useAuthStore.getState().clear();
    await useAuthStore.getState().hydrate();

    expect(useAuthStore.getState().token).toBeNull();
  });
});
