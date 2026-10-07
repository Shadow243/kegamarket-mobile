import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { IconButton } from './icon-button';
import { Text } from './text';

/** Header for pushed screens: back button, centered title, optional trailing actions. */
export function ScreenHeader({ title, trailing }: { title: string; trailing?: ReactNode }) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View className="h-14 flex-row items-center justify-between px-5">
      <IconButton
        icon={ArrowLeft}
        accessibilityLabel={t('common.back')}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      />
      <Text
        variant="headline"
        accessibilityRole="header"
        numberOfLines={1}
        className="absolute left-20 right-20 text-center"
        pointerEvents="none"
      >
        {title}
      </Text>
      <View className="min-w-11 flex-row justify-end gap-2.5">{trailing}</View>
    </View>
  );
}
