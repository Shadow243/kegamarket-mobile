import { Image } from 'expo-image';
import { BadgeCheck, Store } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/components/text';
import { useLocale } from '@/hooks/use-locale';
import { useThemeColors } from '@/hooks/use-theme';
import type { ListingDetail } from '@/types/api';
import { formatMonthYear, initials } from '@/utils/format';

export function SellerCard({ shop }: { shop: ListingDetail['shop'] }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const colors = useThemeColors();
  const verified = shop.verification_level === 'verified';

  const details = [
    shop.active_listings_count !== null
      ? t('listing.activeListings', { count: shop.active_listings_count })
      : null,
    t('listing.memberSince', { date: formatMonthYear(shop.created_at, locale) }),
  ].filter(Boolean);

  return (
    <View
      className="flex-row items-center gap-4 rounded-3xl border border-line p-4"
      style={{ borderCurve: 'continuous' }}
    >
      {shop.logo_url ? (
        <Image source={shop.logo_url} className="h-14 w-14 rounded-2xl" contentFit="cover" />
      ) : (
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-night-900">
          <Text variant="headline" tone="white">
            {initials(shop.name)}
          </Text>
        </View>
      )}
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-1.5">
          <Text variant="headline" numberOfLines={1} className="flex-shrink">
            {shop.name}
          </Text>
          {verified ? (
            <BadgeCheck size={18} color={colors.brand} fill={colors['brand-soft']} />
          ) : null}
        </View>
        <Text variant="caption" tone="muted" numberOfLines={2}>
          {details.join(' · ')}
        </Text>
      </View>
      <Store size={20} color={colors['fg-subtle']} />
    </View>
  );
}
