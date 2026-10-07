import { useMemo } from 'react';

import type { PublicListing } from '@/types/api';
import { toListingCard, type ListingCardModel } from '@/utils/listing-card';

import { useCurrency } from './use-currency';
import { useLocale } from './use-locale';

export function useListingCards(listings: PublicListing[] | undefined): ListingCardModel[] {
  const locale = useLocale();
  const { code, convert } = useCurrency();

  return useMemo(
    () => (listings ?? []).map((listing) => toListingCard(listing, locale, { code, convert })),
    [listings, locale, code, convert],
  );
}
