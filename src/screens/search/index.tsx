import { useLocalSearchParams } from 'expo-router';
import { CloudOff, SearchX, Search as SearchIcon, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/components/chip';
import { ListingGrid } from '@/components/listing-grid';
import { StateView } from '@/components/state-view';
import { Text } from '@/components/text';
import { useCategories } from '@/hooks/use-catalog';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useIsOnline } from '@/hooks/use-is-online';
import { useListingCards } from '@/hooks/use-listing-cards';
import { useListingSearch } from '@/hooks/use-listings';
import { useThemeColors } from '@/hooks/use-theme';
import type { ListingFilters, ListingSort } from '@/lib/api/endpoints';
import { categoryIcon } from '@/utils/category-icon';

const SORTS: (ListingSort | 'relevance')[] = ['relevance', 'newest', 'price_asc', 'price_desc', 'most_viewed'];

type SearchParams = { category?: string; sort?: ListingSort; on_sale?: string; q?: string };

export function Search() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const isOnline = useIsOnline();
  const params = useLocalSearchParams<SearchParams>();

  const [query, setQuery] = useState(params.q ?? '');
  const [category, setCategory] = useState(params.category);
  const [sort, setSort] = useState<ListingSort | undefined>(params.sort);
  const [onSale, setOnSale] = useState(params.on_sale === '1');

  // Home shortcuts navigate here with new params while the tab is already mounted.
  useEffect(() => {
    setCategory(params.category);
    setSort(params.sort);
    setOnSale(params.on_sale === '1');
    if (params.q !== undefined) setQuery(params.q);
  }, [params.category, params.sort, params.on_sale, params.q]);

  const search = useDebouncedValue(query.trim());
  const filters = useMemo<ListingFilters>(
    () => ({ search: search || undefined, category, sort, on_sale: onSale || undefined }),
    [search, category, sort, onSale],
  );

  const categories = useCategories();
  const results = useListingSearch(filters);
  const listings = useMemo(() => results.data?.pages.flatMap((page) => page.data), [results.data]);
  const cards = useListingCards(listings);
  const total = results.data?.pages[0]?.meta.total ?? 0;
  const hasFilters = Boolean(search || category || sort || onSale);

  const clearFilters = () => {
    setQuery('');
    setCategory(undefined);
    setSort(undefined);
    setOnSale(false);
  };

  const header = (
    <View className="pb-2">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-4 pb-3">
        <Chip label={t('search.allCategories')} selected={!category} onPress={() => setCategory(undefined)} />
        {categories.data?.map((item) => (
          <Chip
            key={item.id}
            label={item.name}
            icon={categoryIcon(item.icon)}
            selected={category === item.slug}
            onPress={() => setCategory(category === item.slug ? undefined : item.slug)}
          />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-4 pb-4">
        {SORTS.map((value) => {
          const selected = value === 'relevance' ? !sort : sort === value;
          return (
            <Chip
              key={value}
              label={t(`search.sort.${value}`)}
              selected={selected}
              onPress={() => setSort(value === 'relevance' ? undefined : value)}
            />
          );
        })}
      </ScrollView>
      {results.data ? (
        <Text variant="caption" tone="muted" className="px-4 pb-3">
          {t('search.resultsCount', { count: total })}
        </Text>
      ) : null}
    </View>
  );

  const empty =
    results.data === undefined && !isOnline ? (
      <StateView icon={CloudOff} title={t('network.offlineUnavailable')} />
    ) : results.isError && results.data === undefined ? (
      <StateView
        icon={SearchX}
        title={t('common.genericError')}
        actionLabel={t('common.retry')}
        onAction={() => results.refetch()}
      />
    ) : (
      <StateView
        icon={SearchX}
        title={t('search.noResults')}
        actionLabel={hasFilters ? t('search.clearFilters') : undefined}
        onAction={hasFilters ? clearFilters : undefined}
      />
    );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <View className="px-4 pb-3 pt-2">
        <Text variant="display" accessibilityRole="header" className="mb-4">
          {t('search.title')}
        </Text>
        <View
          className="h-[52px] flex-row items-center gap-3 rounded-2xl border border-line bg-surface px-4"
          style={{ borderCurve: 'continuous' }}
        >
          <SearchIcon size={20} color={colors['fg-muted']} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('search.placeholder')}
            placeholderTextColor={colors['fg-subtle']}
            selectionColor={colors.brand}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel={t('search.placeholder')}
            className="h-full flex-1 font-body text-[16px] text-fg"
          />
          {query ? (
            <Pressable accessibilityRole="button" accessibilityLabel={t('search.clearFilters')} hitSlop={10} onPress={() => setQuery('')}>
              <X size={18} color={colors['fg-muted']} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ListingGrid
        listings={cards}
        isLoading={results.isLoading}
        isFetchingMore={results.isFetchingNextPage}
        isRefreshing={results.isRefetching && !results.isFetchingNextPage}
        onRefresh={() => results.refetch()}
        onEndReached={() => {
          if (results.hasNextPage && !results.isFetchingNextPage) results.fetchNextPage();
        }}
        header={header}
        empty={empty}
      />
    </SafeAreaView>
  );
}
