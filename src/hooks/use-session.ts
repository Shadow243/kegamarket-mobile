import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { unregisterPushDevice } from '@/hooks/use-push-notifications';
import { authApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import { persistOptions } from '@/lib/query/query-client';
import { disconnectEcho } from '@/lib/realtime';
import { useAuthStore } from '@/stores/auth-store';
import type { LoginPayload } from '@/types/api';

export function useCurrentUser() {
  const token = useAuthStore((state) => state.token);
  const query = useQuery({
    queryKey: queryKeys.me(),
    queryFn: ({ signal }) => authApi.me({ signal }),
    enabled: token !== null,
    staleTime: 5 * 60 * 1000,
  });

  return {
    user: token ? (query.data ?? null) : null,
    isAuthenticated: token !== null,
    isLoading: query.isLoading,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  const setToken = useAuthStore((state) => state.setToken);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async ({ token, user }) => {
      await setToken(token);
      queryClient.setQueryData(queryKeys.me(), user);
      // Listings carry a per-user `is_favorited` flag: refetch them for the new viewer.
      await queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

/** Clears the session everywhere, including the on-disk query cache (it holds the user's own data). */
export async function signOutLocally(queryClient: ReturnType<typeof useQueryClient>) {
  await useAuthStore.getState().clear();
  disconnectEcho();
  queryClient.clear();
  await persistOptions.persister.removeClient();
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await unregisterPushDevice();
      await authApi.logout().catch(() => undefined);
    },
    onSettled: () => signOutLocally(queryClient),
  });
}
