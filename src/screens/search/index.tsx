import { useLocalSearchParams } from 'expo-router';
import { CloudOff, SearchX } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/components/chip';
import { useTabBarSpace } from '@/components/floating-tab-bar';
import { ListingGrid } from '@/components/listing-grid';
import { SearchBar } from '@/components/search-bar';
import { SaveSearchButton } from './save-search-button';
import { StateView } from '@/components/state-view';
import { Text } from '@/components/text';
import { useCategories } from '@/hooks/use-catalog';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useIsOnline } from '@/hooks/use-is-online';
import { useListingCards } from '@/hooks/use-listing-cards';
import { useListingSearch } from '@/hooks/use-listings';
import type { ListingFilters, ListingSort } from '@/lib/api/endpoints';
import { categoryIcon } from '@/utils/category-icon';

const SORTS: (ListingSort | 'relevance')[] = [
  'relevance',
  'newest',
  'price_asc',
  'price_desc',
  'most_viewed',
];

type SearchParams = {
  category?: string;
  sort?: ListingSort;
  on_sale?: string;
  q?: string;
  filters?: string;
};

/** Home shortcuts navigate here with new params: remount so the screen starts from them. */
export function Search() {
  const params = useLocalSearchParams<SearchParams>();
  const key = [params.category, params.sort, params.on_sale, params.q, params.filters].join('|');
  return <SearchContent key={key} params={params} />;
}

function SearchContent({ params }: { params: SearchParams }) {
  const { t } = useTranslation();
  const bottomSpace = useTabBarSpace();
  const isOnline = useIsOnline();

  const [query, setQuery] = useState(params.q ?? '');
  const [category, setCategory] = useState(params.category);
  const [sort, setSort] = useState<ListingSort | undefined>(params.sort);
  const [onSale, setOnSale] = useState(params.on_sale === '1');
  const [showSorts, setShowSorts] = useState(params.filters === '1' || Boolean(params.sort));

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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-5 pb-3"
      >
        <Chip
          label={t('search.allCategories')}
          selected={!category}
          onPress={() => setCategory(undefined)}
        />
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
      {showSorts ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-5 pb-3"
        >
          {onSale ? (
            <Chip label={t('home.deals')} selected onPress={() => setOnSale(false)} />
          ) : null}
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
      ) : null}
      {results.data ? (
        <View className="flex-row items-center justify-between px-5 pb-3 pt-1">
          <Text variant="caption" tone="muted">
            {t('search.resultsCount', { count: total })}
          </Text>
          {search || category ? (
            <SaveSearchButton
              key={`${search}|${category ?? ''}`}
              filters={{ search: search || undefined, category }}
            />
          ) : null}
        </View>
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
      <View className="px-5 pb-4 pt-2">
        <Text variant="display" accessibilityRole="header" className="mb-4">
          {t('search.title')}
        </Text>
        <SearchBar
          placeholder={t('search.placeholder')}
          value={query}
          onChangeText={setQuery}
          onFilterPress={() => setShowSorts((value) => !value)}
          filterCount={sort || onSale ? 1 : 0}
        />
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
        bottomInset={bottomSpace}
      />
    </SafeAreaView>
  );
}
