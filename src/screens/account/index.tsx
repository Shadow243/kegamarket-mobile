import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowRight, BadgeCheck, Coins, Languages, LogOut, SunMoon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { useTabBarSpace } from '@/components/floating-tab-bar';
import { Text } from '@/components/text';
import { useCurrency } from '@/hooks/use-currency';
import { useLocale } from '@/hooks/use-locale';
import { useCurrentUser, useLogout } from '@/hooks/use-session';
import { useThemeColors } from '@/hooks/use-theme';
import type { AppLocale } from '@/lib/config';
import { usePreferencesStore, type ThemePreference } from '@/stores/preferences-store';
import { palette } from '@/theme';
import { initials } from '@/utils/format';

import { PreferenceRow } from './preference-row';

const logoLight = require('@/assets/images/logo-kega-light.png');

const LANGUAGES: { value: AppLocale; label: string }[] = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'ln', label: 'Lingala' },
];

const FEATURED_CURRENCIES = ['USD', 'CDF', 'EUR', 'XAF', 'KES', 'NGN', 'ZAR'];

function GuestCard() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View
      className="mx-5 overflow-hidden rounded-[28px] bg-night-900 p-6"
      style={{ borderCurve: 'continuous' }}
    >
      <Image
        source={logoLight}
        className="h-6 w-[82px]"
        contentFit="contain"
        accessibilityLabel="Kega"
      />
      <Text variant="title" tone="white" className="mt-6">
        {t('account.guestTitle')}
      </Text>
      <Text className="mt-2 text-primary-100">{t('account.guestBody')}</Text>
      <Button
        title={t('auth.login')}
        variant="accent"
        trailingIcon={ArrowRight}
        onPress={() => router.push('/login')}
        className="mt-6 self-start"
      />
    </View>
  );
}

function ProfileCard() {
  const { t } = useTranslation();
  const { user } = useCurrentUser();
  if (!user) return null;

  return (
    <View
      className="mx-5 flex-row items-center gap-4 rounded-[28px] bg-surface-muted p-5"
      style={{ borderCurve: 'continuous' }}
    >
      {user.avatar_url ? (
        <Image source={user.avatar_url} className="h-16 w-16 rounded-full" contentFit="cover" />
      ) : (
        <View className="h-16 w-16 items-center justify-center rounded-full bg-night-900">
          <Text variant="headline" tone="white">
            {initials(user.name)}
          </Text>
        </View>
      )}
      <View className="flex-1 gap-0.5">
        <Text variant="headline" numberOfLines={1}>
          {user.name}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {user.email || user.phone}
        </Text>
        {user.email_verified ? (
          <View className="mt-1.5 flex-row items-center gap-1 self-start rounded-full bg-accent-400 px-2.5 py-0.5">
            <BadgeCheck size={13} color={palette.primary[950]} strokeWidth={2.25} />
            <Text variant="caption" className="font-body-bold text-[11px] text-night-900">
              {t('account.verified')}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function Account() {
  const { t } = useTranslation();
  const locale = useLocale() as AppLocale;
  const colors = useThemeColors();
  const bottomSpace = useTabBarSpace();
  const { isAuthenticated } = useCurrentUser();
  const logout = useLogout();
  const currency = useCurrency();
  const { theme, setTheme, setLocale, setCurrency } = usePreferencesStore();

  const currencyOptions = Array.from(
    new Set([
      currency.code,
      ...FEATURED_CURRENCIES.filter((code) => currency.available.includes(code)),
    ]),
  ).map((code) => ({ value: code, label: code }));

  const confirmLogout = () =>
    Alert.alert(t('account.logout'), t('account.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('account.logout'), style: 'destructive', onPress: () => logout.mutate() },
    ]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <ScrollView contentContainerStyle={{ paddingBottom: bottomSpace }}>
        <Text variant="display" accessibilityRole="header" className="px-5 pb-5 pt-2">
          {t('account.title')}
        </Text>

        {isAuthenticated ? <ProfileCard /> : <GuestCard />}

        <Text variant="label" tone="muted" className="mb-2 mt-9 px-5">
          {t('account.preferences')}
        </Text>
        <View
          className="mx-5 rounded-[28px] border border-line bg-surface"
          style={{ borderCurve: 'continuous' }}
        >
          <PreferenceRow
            icon={Languages}
            label={t('account.language')}
            value={locale}
            options={LANGUAGES}
            onChange={setLocale}
          />
          <View className="mx-4 h-px bg-line" />
          <PreferenceRow
            icon={Coins}
            label={t('account.currency')}
            value={currency.code}
            options={currencyOptions}
            onChange={setCurrency}
          />
          <View className="mx-4 h-px bg-line" />
          <PreferenceRow<ThemePreference>
            icon={SunMoon}
            label={t('account.theme')}
            value={theme}
            options={[
              { value: 'system', label: t('account.themeSystem') },
              { value: 'light', label: t('account.themeLight') },
              { value: 'dark', label: t('account.themeDark') },
            ]}
            onChange={setTheme}
          />
        </View>

        {isAuthenticated ? (
          <Pressable
            accessibilityRole="button"
            onPress={confirmLogout}
            disabled={logout.isPending}
            className="mx-5 mt-6 flex-row items-center gap-3 rounded-[28px] border border-line bg-surface px-4 py-4 active:opacity-70"
            style={{ borderCurve: 'continuous' }}
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-muted">
              <LogOut size={18} color={colors['danger-fg']} strokeWidth={2} />
            </View>
            <Text variant="callout" tone="danger">
              {t('account.logout')}
            </Text>
          </Pressable>
        ) : null}

        <Text variant="caption" tone="subtle" className="mt-8 text-center">
          {t('account.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
