import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/text';
import { useCurrency } from '@/hooks/use-currency';
import { useIsOnline } from '@/hooks/use-is-online';
import { useLocale } from '@/hooks/use-locale';
import { useSyncProfileLocale } from '@/hooks/use-profile';
import type { AppLocale } from '@/lib/config';
import { useAuthStore } from '@/stores/auth-store';
import { usePreferencesStore, type ThemePreference } from '@/stores/preferences-store';
import { night } from '@/theme';

export const LANGUAGE_LABELS: Record<AppLocale, string> = {
  fr: 'Français',
  en: 'English',
  ln: 'Lingala',
};

export type PreferenceType = 'language' | 'currency' | 'theme';

interface Option {
  value: string;
  label: string;
}

function OptionList({
  options,
  selected,
  onSelect,
}: {
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View
      className="overflow-hidden rounded-[24px] border border-line bg-surface"
      style={{ borderCurve: 'continuous' }}
    >
      {options.map((option, index) => {
        const isSelected = option.value === selected;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            onPress={() => onSelect(option.value)}
            className={
              index > 0 ? 'border-t border-line active:bg-surface-muted' : 'active:bg-surface-muted'
            }
          >
            <View className="min-h-[54px] flex-row items-center justify-between px-5">
              <Text variant="callout">{option.label}</Text>
              {isSelected ? (
                <View className="h-6 w-6 items-center justify-center rounded-full bg-accent-400">
                  <Check size={14} color={night[900]} strokeWidth={3} />
                </View>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Sheet listing the choices for one preference; picking one applies it and closes the sheet. */
export function PreferencePicker({ type }: { type: PreferenceType }) {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  const currency = useCurrency();
  const isOnline = useIsOnline();
  const isSignedIn = useAuthStore((state) => state.token !== null);
  const syncLocale = useSyncProfileLocale();
  const { theme, setTheme, setLocale, setCurrency } = usePreferencesStore();

  const config: Record<
    PreferenceType,
    { title: string; selected: string; options: Option[]; apply: (value: string) => void }
  > = {
    language: {
      title: t('account.language'),
      selected: locale,
      options: Object.entries(LANGUAGE_LABELS).map(([value, label]) => ({ value, label })),
      apply: (value) => {
        setLocale(value as AppLocale);
        // Emails and notifications follow the account's language on the server.
        if (isSignedIn && isOnline) syncLocale.mutate(value);
      },
    },
    currency: {
      title: t('account.currency'),
      selected: currency.code,
      options: currency.available.map((code) => ({ value: code, label: code })),
      apply: setCurrency,
    },
    theme: {
      title: t('account.theme'),
      selected: theme,
      options: [
        { value: 'system', label: t('account.themeSystem') },
        { value: 'light', label: t('account.themeLight') },
        { value: 'dark', label: t('account.themeDark') },
      ],
      apply: (value) => setTheme(value as ThemePreference),
    },
  };

  const current = config[type];

  return (
    <ScrollView className="bg-canvas" contentContainerClassName="px-5 pb-10 pt-6">
      <Text variant="title" accessibilityRole="header" className="mb-5">
        {current.title}
      </Text>
      <OptionList
        options={current.options}
        selected={current.selected}
        onSelect={(value) => {
          current.apply(value);
          router.back();
        }}
      />
    </ScrollView>
  );
}
