import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { listingsApi, type ListingFilters } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import { patchFavorite } from '@/utils/favorite-cache';

import { useViewerCountry } from './use-catalog';
import { useLocale } from './use-locale';

/** One page of listings — the home page sections. */
export function useListingFeed(filters: ListingFilters) {
  const locale = useLocale();
  const viewerCountry = useViewerCountry();
  const scoped = { ...filters, viewer_country: viewerCountry };

  return useQuery({
    queryKey: queryKeys.listings.search(scoped, locale),
    queryFn: async ({ signal }) => (await listingsApi.list(scoped, { signal })).data,
  });
}

export function useListingSearch(filters: ListingFilters) {
  const locale = useLocale();
  const viewerCountry = useViewerCountry();
  const scoped = { ...filters, viewer_country: viewerCountry };

  return useInfiniteQuery({
    queryKey: [...queryKeys.listings.search(scoped, locale), 'infinite'],
    queryFn: ({ pageParam, signal }) => listingsApi.list({ ...scoped, page: pageParam }, { signal }),
    initialPageParam: 1,
    getNextPageParam: ({ meta }) =>
      meta.current_page < meta.last_page ? meta.current_page + 1 : undefined,
    placeholderData: keepPreviousData,
  });
}

export function useListingDetail(slug: string) {
  const locale = useLocale();
  return useQuery({
    queryKey: queryKeys.listings.detail(slug, locale),
    queryFn: ({ signal }) => listingsApi.bySlug(slug, { signal }),
  });
}

export function useFavoriteListings(enabled: boolean) {
  return useInfiniteQuery({
    queryKey: queryKeys.listings.favorites(),
    queryFn: ({ pageParam, signal }) => listingsApi.favorites(pageParam, { signal }),
    initialPageParam: 1,
    getNextPageParam: ({ meta }) =>
      meta.current_page < meta.last_page ? meta.current_page + 1 : undefined,
    enabled,
  });
}

/** Flips the heart instantly everywhere the listing is cached, and rolls back if the server refuses. */
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const listingsKey = queryKeys.listings.all;

  return useMutation({
    mutationFn: ({ id }: { id: string; favorited: boolean }) => listingsApi.toggleFavorite(id),
    onMutate: async ({ id, favorited }) => {
      await queryClient.cancelQueries({ queryKey: listingsKey });
      const snapshot = queryClient.getQueriesData({ queryKey: listingsKey });
      queryClient.setQueriesData({ queryKey: listingsKey }, (entry) =>
        patchFavorite(entry as Parameters<typeof patchFavorite>[0], id, favorited),
      );
      return { snapshot };
    },
    onError: (_error, _variables, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.listings.favorites() }),
  });
}
