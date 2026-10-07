import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { savedSearchesApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import { useAuthStore } from '@/stores/auth-store';
import type { SavedSearch, SavedSearchFilters } from '@/types/api';

export function useSavedSearches() {
  const isSignedIn = useAuthStore((state) => state.token !== null);
  return useQuery({
    queryKey: queryKeys.savedSearches(),
    queryFn: async ({ signal }) => (await savedSearchesApi.list({ signal })).data,
    enabled: isSignedIn,
  });
}

export function useCreateSavedSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (filters: SavedSearchFilters) =>
      (await savedSearchesApi.create(filters)).saved_search,
    onSuccess: (savedSearch) =>
      queryClient.setQueryData<SavedSearch[]>(queryKeys.savedSearches(), (list) =>
        list ? [savedSearch, ...list] : list,
      ),
  });
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => savedSearchesApi.remove(id),
    onSuccess: (_result, id) =>
      queryClient.setQueryData<SavedSearch[]>(queryKeys.savedSearches(), (list) =>
        list?.filter((savedSearch) => savedSearch.id !== id),
      ),
  });
}
