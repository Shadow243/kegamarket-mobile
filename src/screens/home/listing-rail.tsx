import { FlatList, View } from 'react-native';

import { ListingCard, ListingCardSkeleton } from '@/components/listing-card';
import { SectionHeader } from '@/components/section-header';
import type { ListingCardModel } from '@/utils/listing-card';

export function ListingRail({
  title,
  listings,
  isLoading,
  onSeeAll,
  seeAllLabel,
}: {
  title: string;
  listings: ListingCardModel[];
  isLoading: boolean;
  onSeeAll: () => void;
  seeAllLabel: string;
}) {
  if (!isLoading && listings.length === 0) return null;

  return (
    <View className="mb-8">
      <SectionHeader title={title} actionLabel={seeAllLabel} onAction={onSeeAll} />
      {isLoading && listings.length === 0 ? (
        <View className="flex-row gap-3 px-4">
          <ListingCardSkeleton layout="rail" />
          <ListingCardSkeleton layout="rail" />
          <ListingCardSkeleton layout="rail" />
        </View>
      ) : (
        <FlatList
          horizontal
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ListingCard listing={item} layout="rail" />}
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3 px-4"
        />
      )}
    </View>
  );
}
