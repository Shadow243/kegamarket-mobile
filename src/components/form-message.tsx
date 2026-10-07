import { CircleAlert, CircleCheck } from 'lucide-react-native';
import { View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';
import { palette } from '@/theme';

import { Text } from './text';

/** Result line under a form: success after saving, or the server's error. */
export function FormMessage({ type, message }: { type: 'success' | 'error'; message: string }) {
  const colors = useThemeColors();
  const Icon = type === 'success' ? CircleCheck : CircleAlert;

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className="flex-row items-center gap-2.5 rounded-2xl bg-surface-muted px-4 py-3"
    >
      <Icon size={18} color={type === 'success' ? palette.success[500] : colors['danger-fg']} />
      <Text variant="caption" tone={type === 'success' ? 'default' : 'danger'} className="flex-1">
        {message}
      </Text>
    </View>
  );
}
