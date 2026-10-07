import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { CloudOff, PackageOpen } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTabBarSpace } from '@/components/floating-tab-bar';
import { InlineNotice } from '@/components/inline-notice';
import { ListingCard, ListingCardSkeleton } from '@/components/listing-card';
import { SearchBar } from '@/components/search-bar';
import { SectionHeader } from '@/components/section-header';
import { StateView } from '@/components/state-view';
import { useCategories } from '@/hooks/use-catalog';
import { useIsOnline } from '@/hooks/use-is-online';
import { useListingCards } from '@/hooks/use-listing-cards';
import { useListingFeed } from '@/hooks/use-listings';
import { useScheme, useThemeColors } from '@/hooks/use-theme';
import type { ListingSort } from '@/lib/api/endpoints';

import { CategoryStrip } from './category-strip';
import { HeroCarousel } from './hero-carousel';
import { ListingRail } from './listing-rail';
import { TrustStrip } from './trust-strip';

const logos = {
  light: require('@/assets/images/logo-kega.png'),
  dark: require('@/assets/images/logo-kega-light.png'),
};

const HOME_CATEGORY = 'maison-jardin';

type SearchParams = { category?: string; sort?: ListingSort; on_sale?: string; filters?: string };

export function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const scheme = useScheme();
  const colors = useThemeColors();
  const queryClient = useQueryClient();
  const isOnline = useIsOnline();
  const bottomSpace = useTabBarSpace();

  const categories = useCategories();
  const recent = useListingFeed({});
  const deals = useListingFeed({ on_sale: true });
  const popular = useListingFeed({ sort: 'most_viewed' });

  const recentCards = useListingCards(recent.data);
  const dealCards = useListingCards(deals.data);
  const popularCards = useListingCards(popular.data);
  const isRefreshing = useIsFetching({ queryKey: ['listings'] }) > 0 && !recent.isLoading;

  const openSearch = (params: SearchParams = {}) => router.push({ pathname: '/search', params });

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['listings'] }),
      queryClient.invalidateQueries({ queryKey: ['categories'] }),
    ]);

  const hasNoData = recent.data === undefined;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.fg}
            colors={[colors.brand]}
          />
        }
        contentContainerStyle={{ paddingBottom: bottomSpace }}
      >
        <View className="flex-row items-center justify-between px-5 pb-5 pt-2">
          <Image
            source={logos[scheme]}
            className="h-[26px] w-[90px]"
            contentFit="contain"
            accessibilityLabel="Kega"
          />
        </View>

        <View className="mb-6 px-5">
          <SearchBar
            placeholder={t('home.searchPlaceholder')}
            onPress={() => openSearch()}
            onFilterPress={() => openSearch({ filters: '1' })}
          />
        </View>

        <View className="mb-8">
          <HeroCarousel
            onExplore={() => openSearch()}
            onHome={() => openSearch({ category: HOME_CATEGORY })}
          />
        </View>

        <SectionHeader title={t('home.categories')} />
        <View className="mb-9">
          <CategoryStrip
            categories={categories.data}
            isLoading={categories.isLoading}
            onSelect={(slug) => openSearch({ category: slug })}
          />
        </View>

        {hasNoData && !recent.isLoading ? (
          isOnline ? (
            <StateView
              icon={PackageOpen}
              title={t('common.genericError')}
              actionLabel={t('common.retry')}
              onAction={() => recent.refetch()}
            />
          ) : (
            <StateView icon={CloudOff} title={t('network.offlineUnavailable')} />
          )
        ) : (
          <>
            {recent.isError ? (
              <InlineNotice
                message={t('network.staleData')}
                actionLabel={t('common.retry')}
                onAction={refresh}
              />
            ) : null}

            <ListingRail
              title={t('home.deals')}
              listings={dealCards}
              isLoading={deals.isLoading}
              seeAllLabel={t('common.seeAll')}
              onSeeAll={() => openSearch({ on_sale: '1' })}
            />
            <ListingRail
              title={t('home.popular')}
              listings={popularCards}
              isLoading={popular.isLoading}
              seeAllLabel={t('common.seeAll')}
              onSeeAll={() => openSearch({ sort: 'most_viewed' })}
            />

            <SectionHeader
              title={t('home.recent')}
              actionLabel={t('common.seeAll')}
              onAction={() => openSearch({ sort: 'newest' })}
            />
            {recent.isLoading ? (
              <View className="flex-row flex-wrap justify-between gap-y-7 px-5">
                {Array.from({ length: 4 }, (_, index) => (
                  <View key={index} style={{ width: '48%' }}>
                    <ListingCardSkeleton />
                  </View>
                ))}
              </View>
            ) : recentCards.length === 0 ? (
              <StateView icon={PackageOpen} title={t('home.empty')} />
            ) : (
              <View className="flex-row flex-wrap justify-between gap-y-7 px-5">
                {recentCards.map((listing) => (
                  <View key={listing.id} style={{ width: '48%' }}>
                    <ListingCard listing={listing} />
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        <View className="mt-10">
          <TrustStrip />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
