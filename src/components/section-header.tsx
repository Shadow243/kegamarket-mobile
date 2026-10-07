import { Pressable, View } from 'react-native';

import { Text } from './text';

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="mb-4 flex-row items-center justify-between px-5">
      <Text variant="title" className="text-[20px]" accessibilityRole="header">
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="link"
          hitSlop={10}
          onPress={onAction}
          className="active:opacity-60"
        >
          <Text variant="caption" tone="muted" className="font-body-semibold">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
