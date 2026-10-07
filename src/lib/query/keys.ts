import type { ListingFilters } from '@/lib/api/endpoints';

// Locale is part of every translated resource's key, so switching language never shows a cached
// page in the previous language.
export const queryKeys = {
  me: () => ['auth', 'me'] as const,
  categories: (locale: string) => ['categories', locale] as const,
  currencies: () => ['currencies'] as const,
  country: () => ['country', 'detect'] as const,
  orders: {
    all: ['orders'] as const,
    list: () => ['orders', 'mine'] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
  },
  addresses: () => ['addresses'] as const,
  savedSearches: () => ['saved-searches'] as const,
  applications: () => ['applications'] as const,
  conversations: {
    list: () => ['conversations'] as const,
    messages: (id: string) => ['conversations', 'messages', id] as const,
    support: () => ['conversations', 'support'] as const,
  },
  listings: {
    all: ['listings'] as const,
    search: (filters: ListingFilters, locale: string) =>
      ['listings', 'search', filters, locale] as const,
    detail: (slug: string, locale: string) => ['listings', 'detail', slug, locale] as const,
    favorites: () => ['listings', 'favorites'] as const,
  },
};
