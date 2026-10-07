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
  const color = selected ? colors['on-action'] : colors.fg;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={cn(
        'h-10 flex-row items-center gap-1.5 rounded-full px-[18px] active:opacity-75',
        selected ? 'bg-action' : 'bg-surface-muted',
      )}
    >
      {Icon ? <Icon size={15} color={color} strokeWidth={2.25} /> : null}
      <Text variant="caption" className="font-body-semibold" style={{ color }}>
        {label}
      </Text>
    </Pressable>
  );
}
