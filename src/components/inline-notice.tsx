import { CircleAlert } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';

import { Text } from './text';

/** Non-blocking notice shown above content that is still usable (e.g. a failed background refresh). */
export function InlineNotice({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const colors = useThemeColors();

  return (
    <View className="mx-4 mb-4 flex-row items-center gap-3 rounded-2xl bg-surface-muted px-4 py-3">
      <CircleAlert size={18} color={colors['fg-muted']} />
      <Text variant="caption" tone="muted" className="flex-1">
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onAction}>
          <Text variant="caption" tone="brand" className="font-body-bold">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
