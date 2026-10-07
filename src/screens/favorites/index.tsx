import { useRouter } from 'expo-router';
import { CloudOff, Heart } from 'lucide-react-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTabBarSpace } from '@/components/floating-tab-bar';
import { ListingGrid } from '@/components/listing-grid';
import { StateView } from '@/components/state-view';
import { Text } from '@/components/text';
import { useIsOnline } from '@/hooks/use-is-online';
import { useListingCards } from '@/hooks/use-listing-cards';
import { useFavoriteListings } from '@/hooks/use-listings';
import { useAuthStore } from '@/stores/auth-store';

export function Favorites() {
  const { t } = useTranslation();
  const router = useRouter();
  const isOnline = useIsOnline();
  const bottomSpace = useTabBarSpace();
  const isSignedIn = useAuthStore((state) => state.token !== null);

  const favorites = useFavoriteListings(isSignedIn);
  const listings = useMemo(
    () => favorites.data?.pages.flatMap((page) => page.data),
    [favorites.data],
  );
  const cards = useListingCards(listings);
  const total = favorites.data?.pages[0]?.meta.total;

  const header = (
    <View className="px-5 pb-5 pt-2">
      <Text variant="display" accessibilityRole="header">
        {t('favorites.title')}
      </Text>
      {total ? (
        <Text tone="muted" className="mt-1">
          {t('search.resultsCount', { count: total })}
        </Text>
      ) : null}
    </View>
  );

  if (!isSignedIn) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
        {header}
        <StateView
          icon={Heart}
          title={t('favorites.guestTitle')}
          body={t('favorites.guestBody')}
          actionLabel={t('auth.login')}
          onAction={() => router.push('/login')}
          className="flex-1 justify-center pb-32"
        />
      </SafeAreaView>
    );
  }

  const empty =
    favorites.data === undefined && !isOnline ? (
      <StateView icon={CloudOff} title={t('network.offlineUnavailable')} />
    ) : (
      <StateView
        icon={Heart}
        title={t('favorites.empty')}
        actionLabel={t('favorites.browse')}
        onAction={() => router.push('/search')}
      />
    );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <ListingGrid
        listings={cards}
        isLoading={favorites.isLoading}
        isFetchingMore={favorites.isFetchingNextPage}
        isRefreshing={favorites.isRefetching && !favorites.isFetchingNextPage}
        onRefresh={() => favorites.refetch()}
        onEndReached={() => {
          if (favorites.hasNextPage && !favorites.isFetchingNextPage) favorites.fetchNextPage();
        }}
        header={header}
        empty={empty}
        bottomInset={bottomSpace}
      />
    </SafeAreaView>
  );
}
