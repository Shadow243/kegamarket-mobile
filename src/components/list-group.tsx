import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';
import { cn } from '@/utils/cn';

import { Text, type TextTone } from './text';

export function ListGroup({ title, children }: { title?: string; children: ReactNode }) {
  const items = Children.toArray(children).filter(Boolean);

  return (
    <View className="mb-7 px-5">
      {title ? (
        <Text variant="label" tone="muted" className="mb-2 px-1">
          {title}
        </Text>
      ) : null}
      <View
        className="overflow-hidden rounded-[24px] border border-line bg-surface"
        style={{ borderCurve: 'continuous' }}
      >
        {items.map((child, index) => (
          <Fragment key={index}>
            {index > 0 ? <View className="ml-[64px] h-px bg-line" /> : null}
            {child}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

export interface ListRowProps {
  icon: LucideIcon;
  label: string;
  hint?: string;
  value?: string;
  tone?: TextTone;
  trailing?: ReactNode;
  badge?: number;
  onPress?: () => void;
}

export function ListRow({
  icon: Icon,
  label,
  hint,
  value,
  tone = 'default',
  trailing,
  badge,
  onPress,
}: ListRowProps) {
  const colors = useThemeColors();
  const iconColor = tone === 'danger' ? colors['danger-fg'] : colors.fg;

  const content = (
    <View className="min-h-[60px] flex-row items-center gap-3.5 px-4 py-3">
      <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-muted">
        <Icon size={18} color={iconColor} strokeWidth={2} />
      </View>
      <View className="flex-1">
        <Text variant="callout" tone={tone} numberOfLines={1}>
          {label}
        </Text>
        {hint ? (
          <Text variant="caption" tone="muted" numberOfLines={2} className="mt-0.5 text-[12px]">
            {hint}
          </Text>
        ) : null}
      </View>
      {badge ? (
        <View className="h-5 min-w-5 items-center justify-center rounded-full bg-accent-400 px-1.5">
          <Text variant="caption" className="font-body-bold text-[11px] text-night-900">
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      ) : null}
      {value ? (
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {trailing ?? (onPress ? <ChevronRight size={18} color={colors['fg-subtle']} /> : null)}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      onPress={onPress}
      className={cn('active:bg-surface-muted')}
    >
      {content}
    </Pressable>
  );
}
