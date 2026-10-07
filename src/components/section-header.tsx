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
    <View className="mb-3 flex-row items-end justify-between px-4">
      <Text variant="title" accessibilityRole="header">
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="link" hitSlop={10} onPress={onAction} className="active:opacity-60">
          <Text variant="callout" tone="brand">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
