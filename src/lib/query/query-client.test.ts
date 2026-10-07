import { ApiError } from '@/lib/api/errors';

import { isReachable, shouldPersistQuery, shouldRetry } from './query-client';

describe('shouldRetry', () => {
  it('does not retry client errors', () => {
    expect(shouldRetry(0, new ApiError('Not found', 404))).toBe(false);
  });

  it('retries network and server errors twice', () => {
    expect(shouldRetry(0, new ApiError('Network', 0))).toBe(true);
    expect(shouldRetry(1, new ApiError('Server', 500))).toBe(true);
    expect(shouldRetry(2, new ApiError('Server', 500))).toBe(false);
  });
});

describe('shouldPersistQuery', () => {
  const query = (status: string, meta?: Record<string, unknown>) =>
    ({ state: { status }, meta }) as never;

  it('persists successful queries so visited pages open offline', () => {
    expect(shouldPersistQuery(query('success'))).toBe(true);
  });

  it('skips failed queries and those opted out', () => {
    expect(shouldPersistQuery(query('error'))).toBe(false);
    expect(shouldPersistQuery(query('success', { persist: false }))).toBe(false);
  });
});

describe('isReachable', () => {
  it('treats an unknown reachability as online', () => {
    expect(isReachable({ isConnected: true, isInternetReachable: null })).toBe(true);
  });

  it('is offline when disconnected or the internet is unreachable', () => {
    expect(isReachable({ isConnected: false, isInternetReachable: null })).toBe(false);
    expect(isReachable({ isConnected: true, isInternetReachable: false })).toBe(false);
  });
});
