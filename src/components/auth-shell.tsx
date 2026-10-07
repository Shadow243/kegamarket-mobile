import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowLeft, CircleAlert, CloudOff, X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from '@/components/icon-button';
import { Text } from '@/components/text';
import { useScheme, useThemeColors } from '@/hooks/use-theme';

const logos = {
  light: require('@/assets/images/logo-kega.png'),
  dark: require('@/assets/images/logo-kega-light.png'),
};

/** Layout shared by login, register and forgot password: modal chrome, logo, title, form. */
export function AuthShell({
  title,
  subtitle,
  back = false,
  children,
}: {
  title: string;
  subtitle: string;
  back?: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const scheme = useScheme();

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className={back ? 'flex-row px-5 pt-2' : 'flex-row justify-end px-5 pt-2'}>
          <IconButton
            icon={back ? ArrowLeft : X}
            variant="muted"
            accessibilityLabel={back ? t('common.back') : t('common.close')}
            onPress={() => router.back()}
          />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow px-6 pb-8"
        >
          {back ? null : (
            <Image
              source={logos[scheme]}
              className="mt-4 h-8 w-[110px]"
              contentFit="contain"
              accessibilityLabel="Kega"
            />
          )}
          <Text variant="display" accessibilityRole="header" className={back ? 'mt-4' : 'mt-8'}>
            {title}
          </Text>
          <Text tone="muted" className="mt-2">
            {subtitle}
          </Text>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AuthNotice({ kind, message }: { kind: 'error' | 'offline'; message: string }) {
  const colors = useThemeColors();
  const Icon = kind === 'error' ? CircleAlert : CloudOff;

  return (
    <View
      accessibilityRole={kind === 'error' ? 'alert' : undefined}
      className="mt-6 flex-row items-center gap-3 rounded-2xl bg-surface-muted px-4 py-3"
    >
      <Icon size={18} color={kind === 'error' ? colors['danger-fg'] : colors['fg-muted']} />
      <Text variant="caption" tone={kind === 'error' ? 'danger' : 'muted'} className="flex-1">
        {message}
      </Text>
    </View>
  );
}
