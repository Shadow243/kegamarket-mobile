import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { CloudOff, FileDown, PackageX } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { FormMessage } from '@/components/form-message';
import { OrderTracker } from '@/components/order-tracker';
import { ScreenHeader } from '@/components/screen-header';
import { Skeleton } from '@/components/skeleton';
import { StateView } from '@/components/state-view';
import { StatusBadge } from '@/components/status-badge';
import { Text } from '@/components/text';
import { useIsOnline } from '@/hooks/use-is-online';
import { useLocale } from '@/hooks/use-locale';
import { useDownloadInvoice, useOrder, useOrderAction } from '@/hooks/use-orders';
import { useThemeColors } from '@/hooks/use-theme';
import { isApiError } from '@/lib/api/errors';
import type { Order } from '@/types/api';
import { formatPrice } from '@/utils/format';
import { orderStatusTone } from '@/utils/order-status';

import { AddressStep } from './address-step';
import { EscrowStep } from './escrow-step';
import { PaymentStep } from './payment-step';

const STATUS_MESSAGES = {
  pending_payment: 'orders.pendingMessage',
  paid_escrow: 'orders.escrowMessage',
  completed: 'orders.completedMessage',
  cancelled: 'orders.cancelledMessage',
  disputed: 'orders.disputedMessage',
} as const;

function Summary({ order }: { order: Order }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const address = order.delivery_address;

  return (
    <View
      className="rounded-[24px] border border-line bg-surface p-4"
      style={{ borderCurve: 'continuous' }}
    >
      <View className="flex-row gap-3.5">
        <View className="h-[72px] w-[72px] overflow-hidden rounded-2xl bg-surface-muted">
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
          <Text variant="callout" numberOfLines={2}>
            {order.listing.title}
          </Text>
          <Text variant="caption" tone="muted">
            {order.shop.name}
          </Text>
          <StatusBadge
            label={t(`orders.status.${order.status}`)}
            tone={orderStatusTone(order.status)}
          />
        </View>
      </View>
      <View className="mt-4 gap-2.5 border-t border-line pt-4">
        <View className="flex-row justify-between">
          <Text variant="caption" tone="muted">
            {t('orders.total')}
          </Text>
          <Text variant="headline">{formatPrice(order.price, order.currency, locale)}</Text>
        </View>
        {order.payment_method_label ? (
          <View className="flex-row justify-between">
            <Text variant="caption" tone="muted">
              {t('orders.paidWith')}
            </Text>
            <Text variant="caption" className="text-fg">
              {order.payment_method_label}
            </Text>
          </View>
        ) : null}
        {order.has_delivery_address ? (
          <View className="flex-row justify-between gap-6">
            <Text variant="caption" tone="muted">
              {t('orders.deliverTo')}
            </Text>
            <Text variant="caption" className="flex-1 text-right text-fg">
              {[address.recipient_name, address.delivery_address_line, address.delivery_city]
                .filter(Boolean)
                .join(', ')}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function OrderDetailScreen({ id }: { id: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const isOnline = useIsOnline();
  const order = useOrder(id);
  const cancel = useOrderAction(id);
  const invoice = useDownloadInvoice();
  const data = order.data;

  const title = data ? t('orders.orderTitle', { reference: data.reference }) : t('orders.title');

  if (!data) {
    const notFound =
      isApiError(order.error) && (order.error.status === 404 || order.error.status === 403);
    return (
      <SafeAreaView className="flex-1 bg-canvas">
        <ScreenHeader title={title} />
        {order.isLoading ? (
          <View className="gap-4 px-5 pt-4">
            <Skeleton className="h-[170px] w-full rounded-[24px]" />
            <Skeleton className="h-16 w-full rounded-[24px]" />
            <Skeleton className="h-[220px] w-full rounded-[24px]" />
          </View>
        ) : (
          <StateView
            icon={notFound ? PackageX : CloudOff}
            title={
              notFound
                ? t('orders.notFound')
                : isOnline
                  ? t('common.genericError')
                  : t('network.offlineUnavailable')
            }
            actionLabel={!notFound && isOnline ? t('common.retry') : undefined}
            onAction={() => order.refetch()}
            className="flex-1 justify-center"
          />
        )}
      </SafeAreaView>
    );
  }

  const confirmCancel = () =>
    Alert.alert(t('orders.cancelOrder'), t('orders.cancelOrderConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('orders.cancelOrder'),
        style: 'destructive',
        onPress: () => cancel.mutate({ type: 'cancel' }),
      },
    ]);

  const showTracker = data.status !== 'cancelled' && data.status !== 'disputed';

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <ScreenHeader title={title} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-5 pb-12 pt-3"
          refreshControl={
            <RefreshControl
              refreshing={order.isRefetching}
              onRefresh={() => order.refetch()}
              tintColor={colors.fg}
            />
          }
        >
          <Summary order={data} />

          {showTracker ? (
            <View className="mt-6 items-center">
              <OrderTracker status={data.status} />
            </View>
          ) : null}

          <Text tone="muted" className="mt-6 text-center">
            {t(STATUS_MESSAGES[data.status])}
          </Text>

          {data.status === 'disputed' && data.dispute_reason ? (
            <View className="mt-4 rounded-2xl bg-surface-muted p-4">
              <Text variant="label" tone="muted">
                {t('orders.yourDisputeReason')}
              </Text>
              <Text className="mt-1.5">{data.dispute_reason}</Text>
            </View>
          ) : null}

          <View className="mt-8">
            {data.status === 'pending_payment' && !data.has_delivery_address ? (
              <AddressStep orderId={data.id} />
            ) : null}
            {data.status === 'pending_payment' && data.has_delivery_address ? (
              <PaymentStep order={data} />
            ) : null}
            {data.status === 'paid_escrow' ? <EscrowStep orderId={data.id} /> : null}
          </View>

          <View className="mt-6 gap-2.5">
            {invoice.isError ? (
              <FormMessage type="error" message={t('orders.invoiceError')} />
            ) : null}
            {data.paid_at ? (
              <Button
                title={t('orders.downloadInvoice')}
                variant="outline"
                icon={FileDown}
                loading={invoice.isPending}
                disabled={!isOnline}
                onPress={() => invoice.mutate(data)}
              />
            ) : null}
            <Button
              title={t('orders.viewListing')}
              variant="secondary"
              onPress={() =>
                router.push({ pathname: '/listing/[slug]', params: { slug: data.listing.slug } })
              }
            />
            {data.status === 'pending_payment' ? (
              <Button
                title={t('orders.cancelOrder')}
                variant="ghost"
                loading={cancel.isPending}
                disabled={!isOnline}
                onPress={confirmCancel}
              />
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
