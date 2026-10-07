import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';
import { cn } from '@/utils/cn';
import type { ListingCardModel } from '@/utils/listing-card';

import { FavoriteButton } from './favorite-button';
import { Skeleton } from './skeleton';
import { Text } from './text';

export const RAIL_CARD_WIDTH = 168;

function ListingCardBase({
  listing,
  layout = 'grid',
}: {
  listing: ListingCardModel;
  layout?: 'grid' | 'rail';
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <Link href={{ pathname: '/listing/[slug]', params: { slug: listing.slug } }} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${listing.title}, ${listing.price}, ${listing.city}`}
        className={cn('active:opacity-85', layout === 'grid' ? 'flex-1' : '')}
        style={layout === 'rail' ? { width: RAIL_CARD_WIDTH } : undefined}
      >
        <View
          className="overflow-hidden rounded-2xl bg-surface-muted"
          style={{ aspectRatio: 1, borderCurve: 'continuous' }}
        >
          {listing.imageUrl ? (
            <Image
              source={listing.imageUrl}
              className="h-full w-full"
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              recyclingKey={listing.id}
              accessibilityIgnoresInvertColors
            />
          ) : null}

          <View className="absolute left-2 top-2 flex-row gap-1">
            {listing.discount ? (
              <View className="rounded-full bg-danger-500 px-2 py-0.5">
                <Text variant="label" tone="white">
                  {listing.discount}
                </Text>
              </View>
            ) : null}
            {listing.isBoosted ? (
              <View className="rounded-full bg-accent-400 px-2 py-0.5">
                <Text variant="label" className="text-primary-950">
                  {t('listing.boosted')}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="absolute right-2 top-2">
            <FavoriteButton listingId={listing.id} favorited={listing.isFavorited} />
          </View>
        </View>

        <View className="gap-0.5 px-0.5 pt-2.5">
          <View className="flex-row flex-wrap items-baseline gap-x-1.5">
            <Text variant="price" tone="brand" numberOfLines={1}>
              {listing.price}
            </Text>
            {listing.oldPrice ? (
              <Text variant="caption" tone="subtle" className="line-through">
                {listing.oldPrice}
              </Text>
            ) : null}
          </View>
          {listing.convertedPrice ? (
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {t('listing.approx', { price: listing.convertedPrice })}
            </Text>
          ) : null}
          <Text variant="callout" numberOfLines={2} className="mt-0.5">
            {listing.title}
          </Text>
          <View className="mt-1 flex-row items-center gap-1">
            <MapPin size={12} color={colors['fg-subtle']} strokeWidth={2.25} />
            <Text variant="caption" tone="subtle" numberOfLines={1} className="flex-1">
              {listing.city} · {listing.timeAgo}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

export const ListingCard = memo(ListingCardBase);

export function ListingCardSkeleton({ layout = 'grid' }: { layout?: 'grid' | 'rail' }) {
  return (
    <View
      className={layout === 'grid' ? 'flex-1' : ''}
      style={layout === 'rail' ? { width: RAIL_CARD_WIDTH } : undefined}
    >
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <Skeleton className="mt-3 h-4 w-2/3" />
      <Skeleton className="mt-2 h-3.5 w-full" />
      <Skeleton className="mt-2 h-3 w-1/2" />
    </View>
  );
}
