import { View } from 'react-native';

import type { StatusTone } from '@/utils/order-status';
import { cn } from '@/utils/cn';

import { Text } from './text';

const tones: Record<StatusTone, { container: string; text: string }> = {
  warning: { container: 'bg-amber-500/15', text: 'text-amber-600' },
  brand: { container: 'bg-brand-soft', text: 'text-brand' },
  success: { container: 'bg-emerald-500/15', text: 'text-emerald-600' },
  danger: { container: 'bg-red-500/15', text: 'text-danger-fg' },
  neutral: { container: 'bg-surface-muted', text: 'text-fg-muted' },
};

export function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  return (
    <View className={cn('self-start rounded-full px-2.5 py-1', tones[tone].container)}>
      <Text
        variant="caption"
        className={cn('font-body-bold text-[11px] leading-[14px]', tones[tone].text)}
      >
        {label}
      </Text>
    </View>
  );
}
