import { BadgeCheck, Check, FileUp } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/text';
import { useCurrentUser } from '@/hooks/use-session';
import { useThemeColors } from '@/hooks/use-theme';
import { night, palette } from '@/theme';
import { cn } from '@/utils/cn';

function Step({ index, label, done }: { index: number; label: string; done: boolean }) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-3.5 px-4 py-4">
      <View
        className={cn(
          'h-8 w-8 items-center justify-center rounded-full',
          done ? 'bg-accent-400' : 'bg-surface-muted',
        )}
      >
        {done ? (
          <Check size={16} color={night[900]} strokeWidth={3} />
        ) : (
          <Text variant="caption" className="font-body-bold text-fg">
            {index}
          </Text>
        )}
      </View>
      <Text variant="callout" className="flex-1">
        {label}
      </Text>
      <Text variant="caption" tone={done ? 'default' : 'muted'} className="font-body-semibold">
        {done ? t('settings.stepDone') : t('settings.stepPending')}
      </Text>
    </View>
  );
}

export function VerificationSettings() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { user } = useCurrentUser();
  if (!user) return null;

  const verified = user.verification_level === 'verified';

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <ScreenHeader title={t('settings.verification')} />
      <ScrollView contentContainerClassName="px-5 pb-10 pt-4">
        <View className="rounded-[28px] bg-night-900 p-6" style={{ borderCurve: 'continuous' }}>
          <View
            className={cn(
              'flex-row items-center gap-1.5 self-start rounded-full px-3 py-1',
              verified ? 'bg-accent-400' : 'bg-white/15',
            )}
          >
            <BadgeCheck
              size={14}
              color={verified ? night[900] : palette.white}
              strokeWidth={2.25}
            />
            <Text
              variant="caption"
              className={cn(
                'font-body-bold text-[12px]',
                verified ? 'text-night-900' : 'text-white',
              )}
            >
              {verified ? t('settings.verifiedBadge') : t('settings.unverifiedBadge')}
            </Text>
          </View>
          <Text variant="title" tone="white" className="mt-5">
            {t('settings.verificationTitle')}
          </Text>
          <Text className="mt-2 text-primary-100">{t('settings.verificationSubtitle')}</Text>
        </View>

        <View
          className="mt-6 overflow-hidden rounded-[24px] border border-line bg-surface"
          style={{ borderCurve: 'continuous' }}
        >
          <Step index={1} label={t('settings.emailConfirmedStep')} done={user.email_verified} />
          <View className="ml-[62px] h-px bg-line" />
          <Step index={2} label={t('settings.phoneConfirmedStep')} done={user.phone_verified} />
          <View className="ml-[62px] h-px bg-line" />
          <Step index={3} label={t('settings.documentStep')} done={verified} />
        </View>

        {!verified ? (
          <View className="mt-6 items-center rounded-[24px] border-2 border-dashed border-line-strong px-6 py-8">
            <FileUp size={28} color={colors['fg-subtle']} strokeWidth={1.75} />
            <Text tone="muted" className="mt-3 text-center">
              {t('settings.documentSoon')}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
