import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { catalogApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import { usePreferencesStore } from '@/stores/preferences-store';
import { convertAmount } from '@/utils/format';

const FALLBACK_RATES = { base: 'USD', rates: { USD: 1 } };

export function useCurrency() {
  const preferred = usePreferencesStore((state) => state.currency);
  const { data = FALLBACK_RATES } = useQuery({
    queryKey: queryKeys.currencies(),
    queryFn: ({ signal }) => catalogApi.currencies({ signal }),
    // Rates refresh daily server-side.
    staleTime: 6 * 60 * 60 * 1000,
  });

  const convert = useCallback(
    (amount: number, from: string) => convertAmount(amount, from, preferred, data.rates),
    [preferred, data.rates],
  );

  return {
    code: preferred,
    convert,
    available: Object.keys(data.rates).sort(),
  };
}
