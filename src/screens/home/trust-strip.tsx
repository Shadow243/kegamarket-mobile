import { BadgeCheck, ScanSearch, ShieldCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/components/text';
import { useThemeColors } from '@/hooks/use-theme';

export function TrustStrip() {
  const { t } = useTranslation();
  const colors = useThemeColors();

  const items = [
    { icon: ShieldCheck, label: t('home.trustEscrow') },
    { icon: BadgeCheck, label: t('home.trustVerified') },
    { icon: ScanSearch, label: t('home.trustModerated') },
  ];

  return (
    <View
      className="mx-5 flex-row rounded-3xl border border-line bg-surface py-5"
      style={{ borderCurve: 'continuous' }}
    >
      {items.map(({ icon: Icon, label }, index) => (
        <View
          key={label}
          className={
            index > 0
              ? 'flex-1 items-center gap-2 border-l border-line px-2'
              : 'flex-1 items-center gap-2 px-2'
          }
        >
          <Icon size={22} color={colors.fg} strokeWidth={1.75} />
          <Text
            variant="caption"
            className="text-center font-body-semibold text-[12px] leading-4 text-fg"
          >
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}
