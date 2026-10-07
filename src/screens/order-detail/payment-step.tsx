import {
  Banknote,
  Check,
  CreditCard,
  Smartphone,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/button';
import { FormMessage } from '@/components/form-message';
import { Text } from '@/components/text';
import { TextField } from '@/components/text-field';
import { useIsOnline } from '@/hooks/use-is-online';
import { useLocale } from '@/hooks/use-locale';
import { usePayOrder } from '@/hooks/use-orders';
import { errorMessage, isApiError } from '@/lib/api/errors';
import { night, palette } from '@/theme';
import type { Order, PaymentMethod } from '@/types/api';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/format';
import { isMobileMoney } from '@/utils/order-status';

// Operator brand colors, only used for the small method logos.
const METHODS: { value: PaymentMethod; hint: string; color: string; icon: LucideIcon }[] = [
  { value: 'orange_money', hint: 'orders.hintMobileMoney', color: '#FF7900', icon: Smartphone },
  { value: 'airtel_money', hint: 'orders.hintMobileMoney', color: '#ED1C24', icon: Smartphone },
  { value: 'mpesa', hint: 'orders.hintMobileMoney', color: '#00A651', icon: Smartphone },
  { value: 'card', hint: 'orders.hintCard', color: '#1a3dad', icon: CreditCard },
  { value: 'paypal', hint: 'orders.hintPaypal', color: '#003087', icon: Wallet },
  { value: 'cash', hint: 'orders.hintCash', color: '#475569', icon: Banknote },
];

export function PaymentStep({ order }: { order: Order }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const isOnline = useIsOnline();
  const pay = usePayOrder(order.id, order.delivery_address.recipient_name ?? undefined);
  const [method, setMethod] = useState<PaymentMethod>('orange_money');
  const [phone, setPhone] = useState(order.delivery_address.recipient_phone ?? '');
  const mobileMoney = isMobileMoney(method);

  const phoneError = isApiError(pay.error) ? pay.error.firstFieldError('phone') : undefined;
  const generalError =
    pay.isError && !phoneError
      ? errorMessage(pay.error, t('common.genericError'), t('common.networkError'))
      : null;
  const notConfirmed = pay.isSuccess && pay.data.status === 'pending_payment';

  return (
    <View>
      <Text variant="headline">{t('orders.paymentTitle')}</Text>
      <Text variant="caption" tone="muted" className="mb-4 mt-1">
        {t('orders.payLaterNotice')}
      </Text>

      <View accessibilityRole="radiogroup" className="gap-2.5">
        {METHODS.map(({ value, hint, color, icon: Icon }) => {
          const selected = method === value;
          return (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => setMethod(value)}
              className={cn(
                'flex-row items-center gap-3.5 rounded-2xl border-[1.5px] bg-surface p-3.5',
                selected ? 'border-action' : 'border-line',
              )}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: color }}
              >
                <Icon size={18} color={palette.white} strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text variant="callout">{t(`orders.methods.${value}`)}</Text>
                <Text variant="caption" tone="muted" className="text-[12px]">
                  {t(hint as 'orders.hintCard')}
                </Text>
              </View>
              <View
                className={cn(
                  'h-5 w-5 items-center justify-center rounded-full border-[1.5px]',
                  selected ? 'border-accent-400 bg-accent-400' : 'border-line-strong',
                )}
              >
                {selected ? <Check size={12} color={night[900]} strokeWidth={3} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      {mobileMoney ? (
        <View className="mt-5">
          <TextField
            label={t('orders.mobileMoneyPhone')}
            placeholder="0812345678"
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            value={phone}
            onChangeText={setPhone}
            error={phoneError}
          />
          <Text variant="caption" tone="muted" className="mt-1.5 text-[12px]">
            {t('orders.mobileMoneyPhoneHint')}
          </Text>
        </View>
      ) : null}

      {generalError ? (
        <View className="mt-4">
          <FormMessage type="error" message={generalError} />
        </View>
      ) : null}
      {notConfirmed && !pay.isPending ? (
        <View className="mt-4">
          <FormMessage type="error" message={t('orders.paymentNotConfirmed')} />
        </View>
      ) : null}
      {!isOnline ? (
        <View className="mt-4">
          <FormMessage type="error" message={t('network.paymentRequiresConnection')} />
        </View>
      ) : null}

      <Button
        title={
          pay.isPending
            ? mobileMoney
              ? t('orders.confirmOnPhone')
              : t('orders.awaitingConfirmation')
            : t('orders.payNow', { amount: formatPrice(order.price, order.currency, locale) })
        }
        size="lg"
        loading={pay.isPending}
        disabled={!isOnline}
        onPress={() =>
          !pay.isPending && pay.mutate({ method, phone: mobileMoney ? phone : undefined })
        }
        className="mt-6"
      />
    </View>
  );
}
