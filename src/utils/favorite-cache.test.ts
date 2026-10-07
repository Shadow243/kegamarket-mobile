import type { ListingDetailResponse, Paginated, PublicListing } from '@/types/api';

import { patchFavorite } from './favorite-cache';

const listing = (id: string, is_favorited = false) => ({ id, is_favorited }) as PublicListing;
const page = (...listings: PublicListing[]): Paginated<PublicListing> => ({
  data: listings,
  meta: { current_page: 1, last_page: 1, per_page: 12, total: listings.length },
});

describe('patchFavorite', () => {
  it('updates a listing inside a paginated response', () => {
    const result = patchFavorite(page(listing('a'), listing('b')), 'b', true);

    expect(result.data.map((item) => item.is_favorited)).toEqual([false, true]);
  });

  it('updates every page of an infinite list', () => {
    const result = patchFavorite(
      { pages: [page(listing('a')), page(listing('b'))], pageParams: [1, 2] },
      'b',
      true,
    );

    expect(result.pages[1].data[0].is_favorited).toBe(true);
  });

  it('updates a listing detail response', () => {
    const detail = { listing: { id: 'a', is_favorited: true }, contact_whatsapp_number: null };

    const result = patchFavorite(detail as unknown as ListingDetailResponse, 'a', false);

    expect(result.listing.is_favorited).toBe(false);
  });

  it('returns the same reference when the listing is absent', () => {
    const original = page(listing('a'));

    expect(patchFavorite(original, 'z', true)).toBe(original);
  });
});
