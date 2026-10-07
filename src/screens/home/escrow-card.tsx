import { ShieldCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/components/text';
import { palette } from '@/theme';

export function EscrowCard() {
  const { t } = useTranslation();

  return (
    <View
      className="mx-4 mb-8 flex-row items-center gap-4 overflow-hidden rounded-3xl bg-primary-700 p-5"
      style={{ borderCurve: 'continuous' }}
    >
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-accent-400">
        <ShieldCheck size={24} color={palette.primary[950]} strokeWidth={2.25} />
      </View>
      <View className="flex-1 gap-1">
        <Text variant="headline" tone="white">
          {t('home.escrowTitle')}
        </Text>
        <Text variant="caption" className="text-primary-100">
          {t('home.escrowBody')}
        </Text>
      </View>
    </View>
  );
}
