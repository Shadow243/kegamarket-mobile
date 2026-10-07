import type {
  AuthUser,
  Category,
  CurrencyRates,
  ListingDetailResponse,
  LoginPayload,
  LoginResponse,
  Paginated,
  PublicListing,
} from '@/types/api';

import { request } from './client';

export type ListingSort = 'newest' | 'price_asc' | 'price_desc' | 'most_viewed';

export interface ListingFilters {
  search?: string;
  category?: string;
  city?: string;
  sort?: ListingSort;
  on_sale?: boolean;
  viewer_country?: string;
}

type Signal = { signal?: AbortSignal };

export const listingsApi = {
  list: (filters: ListingFilters & { page?: number }, { signal }: Signal = {}) =>
    request<Paginated<PublicListing>>('/listings', {
      query: { ...filters, on_sale: filters.on_sale ? 1 : undefined },
      signal,
    }),
  bySlug: (slug: string, { signal }: Signal = {}) =>
    request<ListingDetailResponse>(`/listings/slug/${encodeURIComponent(slug)}`, { signal }),
  favorites: (page: number, { signal }: Signal = {}) =>
    request<Paginated<PublicListing>>('/listings/favorites/mine', { query: { page }, signal }),
  toggleFavorite: (listingId: string) =>
    request<{ favorited: boolean }>(`/listings/${listingId}/favorite`, { method: 'POST' }),
};

export const catalogApi = {
  categories: ({ signal }: Signal = {}) => request<{ data: Category[] }>('/categories', { signal }),
  currencies: ({ signal }: Signal = {}) => request<CurrencyRates>('/currencies', { signal }),
  detectCountry: ({ signal }: Signal = {}) =>
    request<{ iso2: string | null }>('/countries/detect', { signal }),
};

export const authApi = {
  login: (payload: LoginPayload) =>
    request<LoginResponse>('/auth/login', { method: 'POST', body: payload }),
  me: ({ signal }: Signal = {}) => request<AuthUser>('/auth/me', { signal }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
};
