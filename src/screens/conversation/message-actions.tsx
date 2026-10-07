import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Copy, Trash2 } from 'lucide-react-native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/text';
import { useThemeColors } from '@/hooks/use-theme';
import type { Message } from '@/types/api';

export const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

/** Long-press sheet on a message: quick reactions, copy, and delete for the sender. */
export function MessageActions({
  message,
  canDelete,
  onReact,
  onDelete,
  onClose,
}: {
  message: Message | null;
  canDelete: boolean;
  onReact: (emoji: string) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (message) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, [message]);

  const confirmDelete = () =>
    Alert.alert(t('messages.deleteMessage'), t('messages.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('messages.deleteMessage'), style: 'destructive', onPress: onDelete },
    ]);

  return (
    <Modal visible={message !== null} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
        onPress={onClose}
        className="flex-1 bg-overlay"
      />
      <View
        className="rounded-t-[28px] bg-surface px-5 pt-5"
        style={{ paddingBottom: Math.max(insets.bottom, 16) + 8, borderCurve: 'continuous' }}
      >
        <View className="mb-5 flex-row justify-between rounded-full bg-surface-muted px-3 py-2">
          {QUICK_REACTIONS.map((emoji) => (
            <Pressable
              key={emoji}
              accessibilityRole="button"
              accessibilityLabel={emoji}
              onPress={() => onReact(emoji)}
              className="h-11 w-11 items-center justify-center rounded-full active:bg-surface"
            >
              <Text className="text-[26px]">{emoji}</Text>
            </Pressable>
          ))}
        </View>

        {message?.body ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              Clipboard.setStringAsync(message.body ?? '');
              onClose();
            }}
            className="flex-row items-center gap-3.5 rounded-2xl px-2 py-3.5 active:bg-surface-muted"
          >
            <Copy size={20} color={colors.fg} />
            <Text variant="callout">{t('messages.copy')}</Text>
          </Pressable>
        ) : null}

        {canDelete ? (
          <Pressable
            accessibilityRole="button"
            onPress={confirmDelete}
            className="flex-row items-center gap-3.5 rounded-2xl px-2 py-3.5 active:bg-surface-muted"
          >
            <Trash2 size={20} color={colors['danger-fg']} />
            <Text variant="callout" tone="danger">
              {t('messages.deleteMessage')}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Modal>
  );
}
