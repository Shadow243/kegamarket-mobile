import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { cn } from '@/utils/cn';
import type { ListingCardModel } from '@/utils/listing-card';

import { FavoriteButton } from './favorite-button';
import { Skeleton } from './skeleton';
import { Text } from './text';

export const RAIL_CARD_WIDTH = 164;
const IMAGE_RATIO = 4 / 5;

function Badge({ label, tone }: { label: string; tone: 'lime' | 'white' }) {
  return (
    <View
      className={cn('rounded-full px-2.5 py-1', tone === 'lime' ? 'bg-accent-400' : 'bg-white')}
    >
      <Text variant="caption" className="font-body-bold text-[11px] leading-[14px] text-night-900">
        {label}
      </Text>
    </View>
  );
}

function ListingCardBase({
  listing,
  layout = 'grid',
}: {
  listing: ListingCardModel;
  layout?: 'grid' | 'rail';
}) {
  const { t } = useTranslation();

  return (
    <Link href={{ pathname: '/listing/[slug]', params: { slug: listing.slug } }} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${listing.title}, ${listing.price}, ${listing.city}`}
        className={cn('active:opacity-85', layout === 'grid' && 'flex-1')}
        style={layout === 'rail' ? { width: RAIL_CARD_WIDTH } : undefined}
      >
        <View
          className="overflow-hidden rounded-3xl bg-surface-muted"
          style={{ aspectRatio: IMAGE_RATIO, borderCurve: 'continuous' }}
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

          <View className="absolute right-2.5 top-2.5">
            <FavoriteButton listingId={listing.id} favorited={listing.isFavorited} />
          </View>

          {listing.discount || listing.isBoosted ? (
            <View className="absolute bottom-2.5 left-2.5 flex-row gap-1.5">
              {listing.discount ? <Badge label={listing.discount} tone="lime" /> : null}
              {listing.isBoosted ? <Badge label={t('listing.boosted')} tone="white" /> : null}
            </View>
          ) : null}
        </View>

        <View className="px-1 pt-3">
          <Text variant="caption" className="font-body-semibold text-fg" numberOfLines={1}>
            {listing.title}
          </Text>
          <View className="mt-1 flex-row flex-wrap items-baseline gap-x-1.5">
            <Text variant="price" numberOfLines={1}>
              {listing.price}
            </Text>
            {listing.oldPrice ? (
              <Text variant="caption" tone="subtle" className="line-through">
                {listing.oldPrice}
              </Text>
            ) : null}
          </View>
          <Text variant="caption" tone="subtle" numberOfLines={1} className="mt-0.5 text-[12px]">
            {listing.convertedPrice
              ? `${t('listing.approx', { price: listing.convertedPrice })} · ${listing.city}`
              : `${listing.city} · ${listing.timeAgo}`}
          </Text>
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
      <Skeleton className="w-full rounded-3xl" style={{ aspectRatio: IMAGE_RATIO }} />
      <Skeleton className="mt-3 h-3.5 w-4/5" />
      <Skeleton className="mt-2 h-4 w-1/2" />
    </View>
  );
}
