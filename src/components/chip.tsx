import type { LucideIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';
import { cn } from '@/utils/cn';

import { Text } from './text';

export function Chip({
  label,
  selected = false,
  icon: Icon,
  onPress,
}: {
  label: string;
  selected?: boolean;
  icon?: LucideIcon;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  const color = selected ? colors['on-brand'] : colors.fg;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={cn(
        'h-9 flex-row items-center gap-1.5 rounded-full border px-3.5 active:opacity-70',
        selected ? 'border-brand bg-brand' : 'border-line bg-surface',
      )}
    >
      {Icon ? <Icon size={15} color={color} strokeWidth={2.25} /> : null}
      <Text variant="caption" style={{ color }}>
        {label}
      </Text>
    </Pressable>
  );
}
