import type { SavedSearchFilters } from '@/types/api';

/** Search-screen params a saved search reopens with (the mobile search supports text and category). */
export function savedSearchParams(filters: SavedSearchFilters): { q?: string; category?: string } {
  return {
    ...(filters.search ? { q: filters.search } : {}),
    ...(filters.category ? { category: filters.category } : {}),
  };
}

/** Human summary of a saved search when it has no name: "frigo · electronique · Kinshasa". */
export function describeSavedSearch(filters: SavedSearchFilters): string {
  const cities = Array.isArray(filters.city) ? filters.city : filters.city ? [filters.city] : [];
  return [filters.search, filters.category, ...cities].filter(Boolean).join(' · ');
}
