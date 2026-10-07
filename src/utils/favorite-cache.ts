import type { InfiniteData } from '@tanstack/react-query';

import type { ListingDetailResponse, Paginated, PublicListing } from '@/types/api';

type ListingCacheEntry =
  | Paginated<PublicListing>
  | InfiniteData<Paginated<PublicListing>>
  | ListingDetailResponse
  | undefined;

function patchPage(page: Paginated<PublicListing>, id: string, favorited: boolean) {
  if (!page.data.some((listing) => listing.id === id)) return page;
  return {
    ...page,
    data: page.data.map((listing) =>
      listing.id === id ? { ...listing, is_favorited: favorited } : listing,
    ),
  };
}

/** Sets `is_favorited` on one listing wherever it appears in a cached listings response. */
export function patchFavorite<T extends ListingCacheEntry>(entry: T, id: string, favorited: boolean): T {
  if (!entry) return entry;
  if ('pages' in entry) {
    return { ...entry, pages: entry.pages.map((page) => patchPage(page, id, favorited)) } as T;
  }
  if ('listing' in entry) {
    return entry.listing.id === id
      ? ({ ...entry, listing: { ...entry.listing, is_favorited: favorited } } as T)
      : entry;
  }
  return patchPage(entry, id, favorited) as T;
}
