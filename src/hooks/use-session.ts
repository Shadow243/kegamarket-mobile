import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { unregisterPushDevice } from '@/hooks/use-push-notifications';
import { authApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import { persistOptions } from '@/lib/query/query-client';
import { disconnectEcho } from '@/lib/realtime';
import { useAuthStore } from '@/stores/auth-store';
import type { LoginPayload, LoginResponse, RegisterPayload } from '@/types/api';

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

function useStartSession() {
  const queryClient = useQueryClient();
  const setToken = useAuthStore((state) => state.setToken);

  return async ({ token, user }: LoginResponse) => {
    await setToken(token);
    queryClient.setQueryData(queryKeys.me(), user);
    // Listings carry a per-user `is_favorited` flag: refetch them for the new viewer.
    await queryClient.invalidateQueries({ queryKey: ['listings'] });
  };
}

export function useLogin() {
  const startSession = useStartSession();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: startSession,
  });
}

/** Registration returns no token, so it signs in right after with the same credentials. */
export function useRegister() {
  const startSession = useStartSession();

  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      await authApi.register(payload);
      return authApi.login({ login: payload.email, password: payload.password });
    },
    onSuccess: startSession,
  });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: (email: string) => authApi.forgotPassword(email) });
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
