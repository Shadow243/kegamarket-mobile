import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BellRing,
  BriefcaseBusiness,
  Coins,
  Languages,
  LockKeyhole,
  LogOut,
  ShieldCheck,
  ShoppingBag,
  SunMoon,
  UserRound,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ListGroup, ListRow } from '@/components/list-group';
import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/text';
import { useCurrency } from '@/hooks/use-currency';
import { useLocale } from '@/hooks/use-locale';
import { useCurrentUser, useLogout } from '@/hooks/use-session';
import type { AppLocale } from '@/lib/config';
import { usePreferencesStore } from '@/stores/preferences-store';
import { palette } from '@/theme';
import { initials } from '@/utils/format';

import { LANGUAGE_LABELS, type PreferenceType } from './preferences';

const logoLight = require('@/assets/images/logo-kega-light.png');

function GuestCard() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View
      className="mx-5 mb-7 overflow-hidden rounded-[28px] bg-night-900 p-6"
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
  const router = useRouter();
  const { user } = useCurrentUser();
  if (!user) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${user.name}, ${t('settings.editProfile')}`}
      onPress={() => router.push('/settings/profile')}
      className="mx-5 mb-7 flex-row items-center gap-4 rounded-[28px] bg-surface-muted p-5 active:opacity-80"
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
        {user.verification_level === 'verified' ? (
          <View className="mt-1.5 flex-row items-center gap-1 self-start rounded-full bg-accent-400 px-2.5 py-0.5">
            <BadgeCheck size={13} color={palette.primary[950]} strokeWidth={2.25} />
            <Text variant="caption" className="font-body-bold text-[11px] text-night-900">
              {t('settings.verifiedBadge')}
            </Text>
          </View>
        ) : null}
      </View>
      <View className="rounded-full bg-surface px-3.5 py-2">
        <Text variant="caption" className="font-body-semibold text-fg">
          {t('settings.editProfile')}
        </Text>
      </View>
    </Pressable>
  );
}

export function Account() {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const currency = useCurrency();
  const theme = usePreferencesStore((state) => state.theme);
  const { user, isAuthenticated } = useCurrentUser();
  const logout = useLogout();

  const themeLabels = {
    system: t('account.themeSystem'),
    light: t('account.themeLight'),
    dark: t('account.themeDark'),
  };

  const confirmLogout = () =>
    Alert.alert(t('account.logout'), t('account.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('account.logout'), style: 'destructive', onPress: () => logout.mutate() },
    ]);

  const openPreference = (type: PreferenceType) =>
    router.push({ pathname: '/settings/preference', params: { type } });

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <ScreenHeader title={t('account.title')} />
      <ScrollView contentContainerClassName="pb-12 pt-3">
        {isAuthenticated ? <ProfileCard /> : <GuestCard />}

        {user ? (
          <ListGroup title={t('account.activity')}>
            <ListRow
              icon={ShoppingBag}
              label={t('orders.title')}
              onPress={() => router.push('/orders')}
            />
            <ListRow
              icon={BriefcaseBusiness}
              label={t('applications.title')}
              onPress={() => router.push('/applications')}
            />
            <ListRow
              icon={BellRing}
              label={t('savedSearches.title')}
              onPress={() => router.push('/saved-searches')}
            />
          </ListGroup>
        ) : null}

        {user ? (
          <ListGroup title={t('settings.title')}>
            <ListRow
              icon={UserRound}
              label={t('settings.personalInfo')}
              hint={t('settings.personalInfoHint')}
              onPress={() => router.push('/settings/profile')}
            />
            <ListRow
              icon={LockKeyhole}
              label={t('settings.security')}
              hint={t('settings.securityHint')}
              onPress={() => router.push('/settings/security')}
            />
            <ListRow
              icon={ShieldCheck}
              label={t('settings.verification')}
              value={
                user.verification_level === 'verified'
                  ? t('settings.verifiedBadge')
                  : t('settings.unverifiedBadge')
              }
              onPress={() => router.push('/settings/verification')}
            />
            <ListRow
              icon={Bell}
              label={t('settings.notifications')}
              hint={t('settings.notificationsHint')}
              onPress={() => router.push('/settings/notifications')}
            />
          </ListGroup>
        ) : null}

        <ListGroup title={t('account.preferences')}>
          <ListRow
            icon={Languages}
            label={t('account.language')}
            value={LANGUAGE_LABELS[locale]}
            onPress={() => openPreference('language')}
          />
          <ListRow
            icon={Coins}
            label={t('account.currency')}
            value={currency.code}
            onPress={() => openPreference('currency')}
          />
          <ListRow
            icon={SunMoon}
            label={t('account.theme')}
            value={themeLabels[theme]}
            onPress={() => openPreference('theme')}
          />
        </ListGroup>

        {isAuthenticated ? (
          <ListGroup>
            <ListRow
              icon={LogOut}
              label={t('account.logout')}
              tone="danger"
              onPress={confirmLogout}
            />
          </ListGroup>
        ) : null}

        <Text variant="caption" tone="subtle" className="text-center">
          {t('account.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
