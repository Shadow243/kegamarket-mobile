import { useQuery } from '@tanstack/react-query';

import { catalogApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import { usePreferencesStore } from '@/stores/preferences-store';

import { useLocale } from './use-locale';

const ONE_HOUR = 60 * 60 * 1000;

export function useCategories() {
  const locale = useLocale();
  return useQuery({
    queryKey: queryKeys.categories(locale),
    queryFn: async ({ signal }) => (await catalogApi.categories({ signal })).data,
    staleTime: 12 * ONE_HOUR,
  });
}

/** The viewer's country: their explicit choice, else the one the API detects from their IP. */
export function useViewerCountry(): string | undefined {
  const chosen = usePreferencesStore((state) => state.country);
  const { data } = useQuery({
    queryKey: queryKeys.country(),
    queryFn: ({ signal }) => catalogApi.detectCountry({ signal }),
    enabled: chosen === null,
    staleTime: 24 * ONE_HOUR,
  });
  return chosen ?? data?.iso2 ?? undefined;
}
