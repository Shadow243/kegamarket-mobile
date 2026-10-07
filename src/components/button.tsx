import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, View, type PressableProps } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';
import { night, type SemanticColor } from '@/theme';
import { cn } from '@/utils/cn';

import { Text } from './text';

type Variant = 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'light';

const containers: Record<Variant, string> = {
  primary: 'bg-action',
  accent: 'bg-accent-400',
  secondary: 'bg-surface-muted',
  outline: 'border-[1.5px] border-line-strong bg-surface',
  ghost: 'bg-transparent',
  light: 'bg-white',
};

const contentColors: Record<Variant, SemanticColor | string> = {
  primary: 'on-action',
  accent: night[900],
  secondary: 'fg',
  outline: 'fg',
  ghost: 'brand',
  light: night[900],
};

const sizes = {
  sm: 'h-10 px-4',
  md: 'h-12 px-6',
  lg: 'h-14 px-7',
} as const;

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: Variant;
  size?: keyof typeof sizes;
  icon?: LucideIcon;
  trailingIcon?: LucideIcon;
  loading?: boolean;
  className?: string;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  trailingIcon: TrailingIcon,
  loading = false,
  disabled = false,
  className,
  ...props
}: ButtonProps) {
  const colors = useThemeColors();
  const token = contentColors[variant];
  const color = token in colors ? colors[token as SemanticColor] : token;
  const iconSize = size === 'sm' ? 16 : 18;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={cn(
        'flex-row items-center justify-center rounded-full active:opacity-85',
        containers[variant],
        sizes[size],
        isDisabled && 'opacity-45',
        className,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <View className="flex-row items-center gap-2">
          {Icon ? <Icon size={iconSize} color={color} strokeWidth={2.25} /> : null}
          <Text variant="callout" style={{ color }} numberOfLines={1}>
            {title}
          </Text>
          {TrailingIcon ? <TrailingIcon size={iconSize} color={color} strokeWidth={2.25} /> : null}
        </View>
      )}
    </Pressable>
  );
}
