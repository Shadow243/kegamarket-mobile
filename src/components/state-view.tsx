import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';
import { cn } from '@/utils/cn';

import { Button } from './button';
import { Text } from './text';

export interface StateViewProps {
  icon: LucideIcon;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/** Empty, error and offline states: say why, then offer the next step. */
export function StateView({ icon: Icon, title, body, actionLabel, onAction, className }: StateViewProps) {
  const colors = useThemeColors();

  return (
    <View className={cn('items-center px-8 py-12', className)}>
      <View className="mb-5 h-16 w-16 items-center justify-center rounded-full bg-brand-soft">
        <Icon size={28} color={colors.brand} strokeWidth={2} />
      </View>
      <Text variant="headline" className="text-center">
        {title}
      </Text>
      {body ? (
        <Text tone="muted" className="mt-2 max-w-[300px] text-center">
          {body}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} size="sm" className="mt-6" />
      ) : null}
    </View>
  );
}
