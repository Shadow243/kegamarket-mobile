import { FlashList } from '@shopify/flash-list';
import type { ReactElement } from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';
import type { ListingCardModel } from '@/utils/listing-card';

import { ListingCard, ListingCardSkeleton } from './listing-card';

const SKELETON_COUNT = 6;

export interface ListingGridProps {
  listings: ListingCardModel[];
  isLoading: boolean;
  isFetchingMore?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  header?: ReactElement;
  empty?: ReactElement;
  bottomInset?: number;
}

export function ListingGrid({
  listings,
  isLoading,
  isFetchingMore = false,
  isRefreshing = false,
  onRefresh,
  onEndReached,
  header,
  empty,
  bottomInset = 24,
}: ListingGridProps) {
  const colors = useThemeColors();

  if (isLoading && listings.length === 0) {
    return (
      <View className="flex-1">
        {header}
        <View className="flex-row flex-wrap justify-between gap-y-7 px-5 pt-2">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <View key={index} style={{ width: '48%' }}>
              <ListingCardSkeleton />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <FlashList
      data={listings}
      numColumns={2}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <View className={index % 2 === 0 ? 'pb-7 pl-5 pr-1.5' : 'pb-7 pl-1.5 pr-5'}>
          <ListingCard listing={item} />
        </View>
      )}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ListFooterComponent={
        isFetchingMore ? <ActivityIndicator className="py-6" color={colors.brand} /> : null
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.6}
      keyboardDismissMode="on-drag"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand}
            colors={[colors.brand]}
          />
        ) : undefined
      }
      contentContainerStyle={{ paddingBottom: bottomInset }}
    />
  );
}
