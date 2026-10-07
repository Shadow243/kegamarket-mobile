import { useTranslation } from 'react-i18next';
import { ScrollView, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormMessage } from '@/components/form-message';
import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/text';
import { useIsOnline } from '@/hooks/use-is-online';
import { useUpdateNotifications } from '@/hooks/use-profile';
import { useCurrentUser } from '@/hooks/use-session';
import { useThemeColors } from '@/hooks/use-theme';
import { palette } from '@/theme';
import type { NotificationPreferences } from '@/types/api';

const KEYS = [
  {
    key: 'new_messages',
    label: 'settings.notificationsNewMessages',
    hint: 'settings.notificationsNewMessagesHint',
  },
  {
    key: 'order_updates',
    label: 'settings.notificationsOrderUpdates',
    hint: 'settings.notificationsOrderUpdatesHint',
  },
  {
    key: 'application_replies',
    label: 'settings.notificationsApplicationReplies',
    hint: 'settings.notificationsApplicationRepliesHint',
  },
  {
    key: 'promotions',
    label: 'settings.notificationsPromotions',
    hint: 'settings.notificationsPromotionsHint',
  },
] as const satisfies { key: keyof NotificationPreferences; label: string; hint: string }[];

export function NotificationSettings() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const isOnline = useIsOnline();
  const { user } = useCurrentUser();
  const update = useUpdateNotifications();
  if (!user) return null;

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <ScreenHeader title={t('settings.notifications')} />
      <ScrollView contentContainerClassName="px-5 pb-10 pt-4">
        <View
          className="overflow-hidden rounded-[24px] border border-line bg-surface"
          style={{ borderCurve: 'continuous' }}
        >
          {KEYS.map(({ key, label, hint }, index) => (
            <View key={key} className={index > 0 ? 'border-t border-line' : undefined}>
              <View className="flex-row items-center gap-4 px-4 py-4">
                <View className="flex-1">
                  <Text variant="callout">{t(label)}</Text>
                  <Text variant="caption" tone="muted" className="mt-1">
                    {t(hint)}
                  </Text>
                </View>
                <Switch
                  accessibilityLabel={t(label)}
                  value={user.notification_preferences[key]}
                  onValueChange={(value) => update.mutate({ [key]: value })}
                  disabled={!isOnline}
                  trackColor={{ false: colors['line-strong'], true: palette.accent[400] }}
                  thumbColor={palette.white}
                  ios_backgroundColor={colors['line-strong']}
                />
              </View>
            </View>
          ))}
        </View>

        <View className="mt-5 gap-3">
          {update.isError ? <FormMessage type="error" message={t('common.genericError')} /> : null}
          {!isOnline ? (
            <FormMessage type="error" message={t('settings.requiresConnection')} />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
