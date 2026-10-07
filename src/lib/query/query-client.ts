import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { focusManager, onlineManager, QueryClient, type Query } from '@tanstack/react-query';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';
import Constants from 'expo-constants';
import { AppState, Platform } from 'react-native';

import { isApiError } from '@/lib/api/errors';

const ONE_DAY = 1000 * 60 * 60 * 24;

/** How long a visited page stays readable offline. Must not exceed the queries' gcTime. */
export const CACHE_MAX_AGE = 7 * ONE_DAY;

export function shouldRetry(failureCount: number, error: unknown): boolean {
  // A 4xx won't change on retry (not found, forbidden, validation); network and 5xx might.
  if (isApiError(error) && error.status >= 400 && error.status < 500) return false;
  return failureCount < 2;
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: CACHE_MAX_AGE,
        // Serve the cache first and try the network once; offline, the query pauses instead of
        // erroring and resumes on its own when the connection comes back.
        networkMode: 'offlineFirst',
        retry: shouldRetry,
      },
      mutations: {
        // Writes (orders, payments, messages) never fire offline.
        networkMode: 'online',
        retry: false,
      },
    },
  });
}

export function shouldPersistQuery(query: Query): boolean {
  return query.state.status === 'success' && query.meta?.persist !== false;
}

export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: createAsyncStoragePersister({
    storage: AsyncStorage,
    key: 'kega-query-cache',
    throttleTime: 1000,
  }),
  maxAge: CACHE_MAX_AGE,
  // A new app version may change response shapes: start from a clean cache rather than crash on old data.
  buster: Constants.expoConfig?.version ?? '1',
  dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery },
};

export function isReachable(state: Pick<NetInfoState, 'isConnected' | 'isInternetReachable'>) {
  return state.isConnected !== false && state.isInternetReachable !== false;
}

let networkManagersConnected = false;

/** Feeds the device's connectivity and foreground state to React Query (reconnect => refetch stale pages). */
export function connectNetworkManagers() {
  if (networkManagersConnected) return;
  networkManagersConnected = true;

  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => setOnline(isReachable(state))),
  );

  if (Platform.OS !== 'web') {
    focusManager.setEventListener((handleFocus) => {
      const subscription = AppState.addEventListener('change', (status) =>
        handleFocus(status === 'active'),
      );
      return () => subscription.remove();
    });
  }
}
