import { Check } from 'lucide-react-native';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { night } from '@/theme';
import type { OrderStatus } from '@/types/api';
import { cn } from '@/utils/cn';
import { orderTrackerStep } from '@/utils/order-status';

import { Text } from './text';

export function OrderTracker({
  status,
  compact = false,
}: {
  status: OrderStatus;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const current = orderTrackerStep(status);
  const steps = [t('orders.stepPlaced'), t('orders.stepPayment'), t('orders.stepConfirmation')];
  const size = compact ? 'h-6 w-6' : 'h-8 w-8';

  return (
    <View className="flex-row items-start">
      {steps.map((label, index) => {
        const step = index + 1;
        const done = current > step || current === 3;
        const active = current === step && !done;
        return (
          <Fragment key={label}>
            {index > 0 ? (
              <View
                className={cn(
                  'mx-1 h-0.5 flex-1 rounded-full',
                  current >= step ? 'bg-accent-400' : 'bg-line',
                )}
                style={{ marginTop: compact ? 11 : 15 }}
              />
            ) : null}
            <View className="items-center gap-1.5" style={{ width: compact ? 64 : 76 }}>
              <View
                className={cn(
                  'items-center justify-center rounded-full',
                  size,
                  done ? 'bg-accent-400' : active ? 'bg-action' : 'bg-surface-muted',
                )}
              >
                {done ? (
                  <Check size={compact ? 12 : 15} color={night[900]} strokeWidth={3} />
                ) : (
                  <Text
                    variant="caption"
                    className={cn(
                      'font-body-bold text-[11px]',
                      active ? 'text-on-action' : 'text-fg-muted',
                    )}
                  >
                    {step}
                  </Text>
                )}
              </View>
              <Text
                variant="caption"
                numberOfLines={1}
                className={cn(
                  'text-[11px]',
                  done || active ? 'font-body-semibold text-fg' : 'text-fg-muted',
                )}
              >
                {label}
              </Text>
            </View>
          </Fragment>
        );
      })}
    </View>
  );
}
