import type { LucideIcon } from 'lucide-react-native';
import { Pressable, type PressableProps } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';
import { cn } from '@/utils/cn';

export interface IconButtonProps extends Omit<PressableProps, 'children'> {
  icon: LucideIcon;
  accessibilityLabel: string;
  variant?: 'surface' | 'floating' | 'plain';
  color?: string;
  filled?: boolean;
  size?: number;
  className?: string;
}

const containers = {
  surface: 'bg-surface-muted',
  floating: 'bg-surface shadow-sm',
  plain: 'bg-transparent',
} as const;

export function IconButton({
  icon: Icon,
  variant = 'surface',
  color,
  filled = false,
  size = 40,
  className,
  ...props
}: IconButtonProps) {
  const colors = useThemeColors();
  const iconColor = color ?? colors.fg;

  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={8}
      className={cn('items-center justify-center rounded-full active:opacity-70', containers[variant], className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <Icon
        size={Math.round(size * 0.48)}
        color={iconColor}
        fill={filled ? iconColor : 'transparent'}
        strokeWidth={2.25}
      />
    </Pressable>
  );
}
