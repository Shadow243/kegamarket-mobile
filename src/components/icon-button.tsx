import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View, type PressableProps } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';
import { night, palette } from '@/theme';
import { cn } from '@/utils/cn';

import { Text } from './text';

type Variant = 'outline' | 'floating' | 'muted' | 'solid' | 'glass';

const containers: Record<Variant, string> = {
  outline: 'border border-line bg-surface',
  floating: 'bg-white',
  muted: 'bg-surface-muted',
  solid: 'bg-action',
  glass: 'bg-black/30',
};

export interface IconButtonProps extends Omit<PressableProps, 'children'> {
  icon: LucideIcon;
  accessibilityLabel: string;
  variant?: Variant;
  color?: string;
  filled?: boolean;
  size?: number;
  badge?: number;
  className?: string;
  children?: ReactNode;
}

export function IconButton({
  icon: Icon,
  variant = 'outline',
  color,
  filled = false,
  size = 44,
  badge,
  className,
  ...props
}: IconButtonProps) {
  const colors = useThemeColors();
  const defaultColor = {
    solid: colors['on-action'],
    floating: night[900],
    glass: palette.white,
    outline: colors.fg,
    muted: colors.fg,
  }[variant];
  const iconColor = color ?? defaultColor;

  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={6}
      className={cn(
        'items-center justify-center rounded-full active:opacity-70',
        containers[variant],
        className,
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      <Icon
        size={Math.round(size * 0.45)}
        color={iconColor}
        fill={filled ? iconColor : 'transparent'}
        strokeWidth={2}
      />
      {badge ? (
        <View className="absolute -right-0.5 -top-0.5 h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-400 px-1">
          <Text variant="label" className="text-[10px] text-night-900">
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
