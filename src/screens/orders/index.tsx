import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { CloudOff, ShoppingBag } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/components/chip';
import { OrderTracker } from '@/components/order-tracker';
import { ScreenHeader } from '@/components/screen-header';
import { Skeleton } from '@/components/skeleton';
import { StateView } from '@/components/state-view';
import { StatusBadge } from '@/components/status-badge';
import { Text } from '@/components/text';
import { useIsOnline } from '@/hooks/use-is-online';
import { useLocale } from '@/hooks/use-locale';
import { useOrders } from '@/hooks/use-orders';
import { useThemeColors } from '@/hooks/use-theme';
import type { Order } from '@/types/api';
import { formatPrice, formatTimeAgo } from '@/utils/format';
import {
  matchesOrderFilter,
  ORDER_FILTERS,
  orderStatusTone,
  type OrderFilter,
} from '@/utils/order-status';

const FILTER_LABELS = {
  all: 'orders.filterAll',
  active: 'orders.filterActive',
  completed: 'orders.filterCompleted',
  disputed: 'orders.filterDisputed',
} as const;

function OrderCard({ order }: { order: Order }) {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  const showTracker = order.status !== 'cancelled' && order.status !== 'disputed';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/orders/[id]', params: { id: order.id } })}
      className="rounded-[24px] border border-line bg-surface p-4 active:opacity-85"
      style={{ borderCurve: 'continuous' }}
    >
      <View className="flex-row gap-3.5">
        <View className="h-16 w-16 overflow-hidden rounded-2xl bg-surface-muted">
          {order.listing.thumbnail_url ? (
            <Image
              source={order.listing.thumbnail_url}
              className="h-full w-full"
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : null}
        </View>
        <View className="flex-1 gap-1">
          <Text variant="callout" numberOfLines={1}>
            {order.listing.title}
          </Text>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {formatPrice(order.price, order.currency, locale)} · {order.shop.name}
          </Text>
          <Text variant="caption" tone="subtle" className="text-[12px]">
            {t('orders.orderedAgo', { time: formatTimeAgo(order.created_at, locale) })}
          </Text>
        </View>
        <StatusBadge
          label={t(`orders.status.${order.status}`)}
          tone={orderStatusTone(order.status)}
        />
      </View>
      {showTracker ? (
        <View className="mt-4 border-t border-line pt-4">
          <OrderTracker status={order.status} compact />
        </View>
      ) : null}
    </Pressable>
  );
}

export function Orders() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const isOnline = useIsOnline();
  const orders = useOrders();
  const [filter, setFilter] = useState<OrderFilter>('all');

  const all = useMemo(() => orders.data ?? [], [orders.data]);
  const visible = useMemo(
    () => all.filter((order) => matchesOrderFilter(order, filter)),
    [all, filter],
  );

  const empty =
    orders.data === undefined && !isOnline ? (
      <StateView icon={CloudOff} title={t('network.offlineUnavailable')} />
    ) : orders.isError && orders.data === undefined ? (
      <StateView
        icon={ShoppingBag}
        title={t('common.genericError')}
        actionLabel={t('common.retry')}
        onAction={() => orders.refetch()}
      />
    ) : (
      <StateView
        icon={ShoppingBag}
        title={filter === 'all' ? t('orders.emptyAll') : t('orders.empty')}
        actionLabel={filter === 'all' ? t('orders.browse') : undefined}
        onAction={filter === 'all' ? () => router.push('/search') : undefined}
      />
    );

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <ScreenHeader title={t('orders.title')} />
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-5 py-3"
        >
          {ORDER_FILTERS.map((key) => (
            <Chip
              key={key}
              label={`${t(FILTER_LABELS[key])} (${all.filter((order) => matchesOrderFilter(order, key)).length})`}
              selected={filter === key}
              onPress={() => setFilter(key)}
            />
          ))}
        </ScrollView>
      </View>

      {orders.isLoading ? (
        <View className="gap-3 px-5 pt-2">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-[150px] w-full rounded-[24px]" />
          ))}
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(order) => order.id}
          renderItem={({ item }) => <OrderCard order={item} />}
          ItemSeparatorComponent={() => <View className="h-3" />}
          ListEmptyComponent={empty}
          contentContainerClassName="px-5 pb-12 pt-2"
          refreshControl={
            <RefreshControl
              refreshing={orders.isRefetching}
              onRefresh={() => orders.refetch()}
              tintColor={colors.fg}
              colors={[colors.brand]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
