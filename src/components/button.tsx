import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, View, type PressableProps } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';
import { palette } from '@/theme';
import { cn } from '@/utils/cn';

import { Text, type TextTone } from './text';

const variants = {
  primary: { container: 'bg-brand', tone: 'on-brand' },
  accent: { container: 'bg-accent-400', tone: 'default' },
  secondary: { container: 'bg-surface-muted', tone: 'default' },
  outline: { container: 'border-[1.5px] border-line-strong bg-surface', tone: 'default' },
  ghost: { container: 'bg-transparent', tone: 'brand' },
} as const satisfies Record<string, { container: string; tone: TextTone }>;

const sizes = {
  sm: 'h-10 px-4 gap-1.5',
  md: 'h-12 px-5 gap-2',
  lg: 'h-14 px-6 gap-2',
} as const;

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  icon?: LucideIcon;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  const colors = useThemeColors();
  const { container, tone } = variants[variant];
  const contentColor =
    tone === 'on-brand' ? colors['on-brand'] : tone === 'brand' ? colors.brand : variant === 'accent' ? palette.primary[950] : colors.fg;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={cn(
        'flex-row items-center justify-center rounded-2xl active:opacity-80',
        container,
        sizes[size],
        fullWidth && 'self-stretch',
        isDisabled && 'opacity-50',
        className,
      )}
      style={{ borderCurve: 'continuous' }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={contentColor} />
      ) : (
        <View className="flex-row items-center gap-2">
          {Icon ? <Icon size={size === 'sm' ? 16 : 18} color={contentColor} strokeWidth={2.25} /> : null}
          <Text variant="callout" style={{ color: contentColor }} numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
