import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import {
  ArrowLeft,
  CloudOff,
  MapPin,
  MessageCircle,
  PackageX,
  Share2,
  ShieldCheck,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, ScrollView, Share, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { FavoriteButton } from '@/components/favorite-button';
import { IconButton } from '@/components/icon-button';
import { Skeleton } from '@/components/skeleton';
import { StateView } from '@/components/state-view';
import { Text } from '@/components/text';
import { useCategories } from '@/hooks/use-catalog';
import { useCurrency } from '@/hooks/use-currency';
import { useIsOnline } from '@/hooks/use-is-online';
import { useListingDetail } from '@/hooks/use-listings';
import { useLocale } from '@/hooks/use-locale';
import { useThemeColors } from '@/hooks/use-theme';
import { isApiError } from '@/lib/api/errors';
import { SITE_URL } from '@/lib/config';
import { palette } from '@/theme';
import { formatPrice, formatTimeAgo } from '@/utils/format';
import { listingSpecs } from '@/utils/listing-specs';

import { Gallery } from './gallery';
import { SellerCard } from './seller-card';

const SHEET_OVERLAP = 28;

function DetailSkeleton({ galleryHeight }: { galleryHeight: number }) {
  return (
    <View>
      <Skeleton className="w-full rounded-none" style={{ height: galleryHeight }} />
      <View className="gap-3 px-5 pt-8">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-7 w-4/5" />
        <Skeleton className="h-7 w-1/3" />
        <Skeleton className="mt-4 h-24 w-full rounded-3xl" />
      </View>
    </View>
  );
}

export function ListingDetailScreen({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const isOnline = useIsOnline();
  const { width } = useWindowDimensions();
  const galleryHeight = Math.round(width * 1.05);
  const [expanded, setExpanded] = useState(false);

  const detail = useListingDetail(slug);
  const categories = useCategories();
  const currency = useCurrency();
  const listing = detail.data?.listing;
  const whatsapp = detail.data?.contact_whatsapp_number;

  const specs = useMemo(() => {
    if (!listing) return [];
    const definitions = categories.data?.find(
      (category) => category.slug === listing.category.slug,
    )?.attributes;
    return listingSpecs(listing.attributes, definitions, {
      yes: t('common.yes'),
      no: t('common.no'),
    });
  }, [listing, categories.data, t]);

  const webUrl = `${SITE_URL}${locale === 'fr' ? '' : `/${locale}`}/listing/${slug}`;
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const topBar = (
    <View
      className="absolute left-0 right-0 flex-row justify-between px-5"
      style={{ top: insets.top + 8 }}
    >
      <IconButton
        icon={ArrowLeft}
        variant="floating"
        accessibilityLabel={t('common.back')}
        onPress={goBack}
      />
      {listing ? (
        <View className="flex-row gap-2.5">
          <IconButton
            icon={Share2}
            variant="floating"
            accessibilityLabel={t('common.share')}
            onPress={() =>
              Share.share({ message: `${listing.localized_title} — ${webUrl}`, url: webUrl })
            }
          />
          <FavoriteButton listingId={listing.id} favorited={listing.is_favorited} size={44} />
        </View>
      ) : null}
    </View>
  );

  if (!listing) {
    const notFound = isApiError(detail.error) && detail.error.status === 404;
    return (
      <View className="flex-1 bg-canvas">
        {detail.isLoading ? (
          <DetailSkeleton galleryHeight={galleryHeight} />
        ) : (
          <StateView
            icon={notFound ? PackageX : CloudOff}
            title={
              notFound
                ? t('listing.notFound')
                : !isOnline
                  ? t('network.offlineUnavailable')
                  : t('common.genericError')
            }
            actionLabel={notFound ? t('common.back') : isOnline ? t('common.retry') : undefined}
            onAction={notFound ? goBack : () => detail.refetch()}
            className="flex-1 justify-center"
          />
        )}
        {topBar}
      </View>
    );
  }

  const amount = Number.parseFloat(listing.price);
  const converted =
    currency.code !== listing.currency
      ? formatPrice(currency.convert(amount, listing.currency), currency.code, locale)
      : null;
  const location = [listing.commune, listing.city].filter(Boolean).join(', ');

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <Gallery photos={listing.photos} title={listing.localized_title} height={galleryHeight} />

        <View
          className="rounded-t-[32px] bg-canvas px-5 pt-7"
          style={{ marginTop: -SHEET_OVERLAP, borderCurve: 'continuous' }}
        >
          <View className="flex-row items-center justify-between">
            <View className="rounded-full bg-surface-muted px-3 py-1">
              <Text variant="caption" className="font-body-semibold text-[12px] text-fg">
                {listing.category.name}
              </Text>
            </View>
            {listing.reference ? (
              <Text variant="caption" tone="subtle">
                {listing.reference}
              </Text>
            ) : null}
          </View>

          <Text variant="title" className="mt-4 text-[24px] leading-[30px]">
            {listing.localized_title}
          </Text>

          <View className="mt-3 flex-row flex-wrap items-center gap-x-2.5 gap-y-1">
            <Text variant="display" className="text-[30px] leading-9">
              {formatPrice(amount, listing.currency, locale)}
            </Text>
            {listing.is_on_sale && listing.compare_at_price ? (
              <Text tone="subtle" className="line-through">
                {formatPrice(listing.compare_at_price, listing.currency, locale)}
              </Text>
            ) : null}
            {listing.is_on_sale && listing.discount_percent ? (
              <View className="rounded-full bg-accent-400 px-2.5 py-0.5">
                <Text variant="caption" className="font-body-bold text-night-900">
                  -{listing.discount_percent}%
                </Text>
              </View>
            ) : null}
          </View>
          {converted ? (
            <Text tone="muted" className="mt-0.5">
              {t('listing.approx', { price: converted })}
            </Text>
          ) : null}

          <View className="mt-4 flex-row items-center gap-1.5">
            <MapPin size={15} color={colors['fg-muted']} />
            <Text variant="caption" tone="muted">
              {location} · {formatTimeAgo(listing.published_at ?? listing.created_at, locale)}
            </Text>
          </View>

          <View
            className="mt-6 flex-row items-center gap-3 rounded-3xl bg-night-900 px-4 py-3.5"
            style={{ borderCurve: 'continuous' }}
          >
            <ShieldCheck size={22} color={palette.accent[400]} />
            <Text variant="caption" className="flex-1 text-primary-100">
              {t('home.escrowBody')}
            </Text>
          </View>

          {specs.length > 0 ? (
            <View className="mt-8">
              <Text variant="headline" className="mb-3">
                {t('listing.details')}
              </Text>
              <View className="flex-row flex-wrap justify-between gap-y-2.5">
                {specs.map((spec) => (
                  <View
                    key={spec.key}
                    className="rounded-2xl bg-surface-muted px-4 py-3"
                    style={{ width: '48.5%' }}
                  >
                    <Text variant="caption" tone="muted" className="text-[12px]">
                      {spec.label}
                    </Text>
                    <Text variant="callout" className="mt-0.5" numberOfLines={2}>
                      {spec.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {listing.localized_description ? (
            <View className="mt-8">
              <Text variant="headline" className="mb-2">
                {t('listing.description')}
              </Text>
              <Text tone="muted" className="leading-6" numberOfLines={expanded ? undefined : 5}>
                {listing.localized_description}
              </Text>
              {listing.localized_description.length > 220 ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setExpanded((value) => !value)}
                  hitSlop={8}
                >
                  <Text variant="caption" className="mt-2 font-body-bold text-fg underline">
                    {expanded ? t('common.readLess') : t('common.readMore')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <View className="mt-8">
            <Text variant="headline" className="mb-3">
              {t('listing.seller')}
            </Text>
            <SellerCard shop={listing.shop} />
          </View>
        </View>
      </ScrollView>

      {topBar}

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-line bg-canvas px-5 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        {!isOnline ? (
          <View className="mb-2.5 flex-row items-center justify-center gap-1.5">
            <CloudOff size={14} color={colors['fg-muted']} />
            <Text variant="caption" tone="muted">
              {t('network.paymentRequiresConnection')}
            </Text>
          </View>
        ) : null}
        <View className="flex-row gap-3">
          {whatsapp ? (
            <Button
              title={t('listing.contactWhatsApp')}
              variant="outline"
              size="lg"
              icon={MessageCircle}
              onPress={() =>
                Linking.openURL(
                  `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`${listing.localized_title} — ${webUrl}`)}`,
                )
              }
              className="flex-1"
            />
          ) : null}
          <Button
            title={t('listing.buySecurely')}
            size="lg"
            icon={ShieldCheck}
            disabled={!isOnline}
            onPress={() => WebBrowser.openBrowserAsync(webUrl)}
            className="flex-[1.4]"
          />
        </View>
      </View>
    </View>
  );
}
