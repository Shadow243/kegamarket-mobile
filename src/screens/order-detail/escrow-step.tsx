import { ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { FormMessage } from '@/components/form-message';
import { Text } from '@/components/text';
import { useIsOnline } from '@/hooks/use-is-online';
import { useOrderAction } from '@/hooks/use-orders';
import { useThemeColors } from '@/hooks/use-theme';
import { errorMessage } from '@/lib/api/errors';
import { palette } from '@/theme';

export function EscrowStep({ orderId }: { orderId: string }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const isOnline = useIsOnline();
  const action = useOrderAction(orderId);
  const [disputing, setDisputing] = useState(false);
  const [reason, setReason] = useState('');

  const confirmReceipt = () =>
    Alert.alert(t('orders.confirmReceipt'), t('orders.confirmReceiptBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('orders.confirmReceipt'),
        onPress: () => action.mutate({ type: 'confirm-receipt' }),
      },
    ]);

  const error = action.isError
    ? errorMessage(action.error, t('common.genericError'), t('common.networkError'))
    : null;

  if (disputing) {
    return (
      <View>
        <Text variant="headline">{t('orders.disputeButton')}</Text>
        <Text variant="caption" className="mb-2 mt-4 text-fg">
          {t('orders.disputeReasonLabel')}
        </Text>
        <TextInput
          value={reason}
          onChangeText={setReason}
          multiline
          maxLength={2000}
          textAlignVertical="top"
          placeholderTextColor={colors['fg-subtle']}
          selectionColor={colors.brand}
          accessibilityLabel={t('orders.disputeReasonLabel')}
          className="min-h-[130px] rounded-2xl border-[1.5px] border-line bg-surface p-4 font-body text-[15px] text-fg"
        />
        {error ? (
          <View className="mt-4">
            <FormMessage type="error" message={error} />
          </View>
        ) : null}
        <View className="mt-5 flex-row gap-3">
          <Button
            title={t('common.cancel')}
            variant="outline"
            onPress={() => setDisputing(false)}
            className="flex-1"
          />
          <Button
            title={t('orders.disputeSubmit')}
            loading={action.isPending}
            disabled={!isOnline || reason.trim().length === 0}
            onPress={() => action.mutate({ type: 'dispute', reason: reason.trim() })}
            className="flex-1"
          />
        </View>
      </View>
    );
  }

  return (
    <View>
      <View className="rounded-[24px] bg-night-900 p-5" style={{ borderCurve: 'continuous' }}>
        <View className="flex-row items-center gap-2">
          <ShieldCheck size={20} color={palette.accent[400]} />
          <Text variant="callout" tone="white">
            {t('orders.escrowHowTitle')}
          </Text>
        </View>
        {[t('orders.escrowHowStep1'), t('orders.escrowHowStep2'), t('orders.escrowHowStep3')].map(
          (step, index) => (
            <View key={step} className="mt-3 flex-row gap-3">
              <Text variant="caption" className="font-body-bold text-accent-400">
                {index + 1}
              </Text>
              <Text variant="caption" className="flex-1 text-primary-100">
                {step}
              </Text>
            </View>
          ),
        )}
      </View>

      {error ? (
        <View className="mt-4">
          <FormMessage type="error" message={error} />
        </View>
      ) : null}

      <Button
        title={t('orders.confirmReceipt')}
        size="lg"
        loading={action.isPending}
        disabled={!isOnline}
        onPress={confirmReceipt}
        className="mt-6"
      />
      <Button
        title={t('orders.disputeButton')}
        variant="ghost"
        disabled={!isOnline}
        onPress={() => setDisputing(true)}
        className="mt-2"
      />
    </View>
  );
}
