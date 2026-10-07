import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { CircleUserRound } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useCurrentUser } from '@/hooks/use-session';
import { initials } from '@/utils/format';

import { IconButton } from './icon-button';
import { Text } from './text';

/** The only entry point to the account: the user's photo or initials once signed in. */
export function AccountButton() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useCurrentUser();
  const open = () => router.push('/account');

  if (!user) {
    return (
      <IconButton icon={CircleUserRound} accessibilityLabel={t('tabs.account')} onPress={open} />
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('tabs.account')}
      onPress={open}
      hitSlop={6}
      className="active:opacity-75"
    >
      {user.avatar_url ? (
        <Image source={user.avatar_url} className="h-11 w-11 rounded-full" contentFit="cover" />
      ) : (
        <View className="h-11 w-11 items-center justify-center rounded-full bg-night-900">
          <Text variant="caption" tone="white" className="font-body-bold">
            {initials(user.name)}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
