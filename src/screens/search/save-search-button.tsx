import { useRouter } from 'expo-router';
import { BellPlus, BellRing } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable } from 'react-native';

import { Text } from '@/components/text';
import { useIsOnline } from '@/hooks/use-is-online';
import { useCreateSavedSearch } from '@/hooks/use-saved-searches';
import { useThemeColors } from '@/hooks/use-theme';
import { errorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/stores/auth-store';
import type { SavedSearchFilters } from '@/types/api';

export function SaveSearchButton({ filters }: { filters: SavedSearchFilters }) {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const isOnline = useIsOnline();
  const isSignedIn = useAuthStore((state) => state.token !== null);
  const save = useCreateSavedSearch();
  const saved = save.isSuccess;
  const Icon = saved ? BellRing : BellPlus;

  const onPress = () => {
    if (!isSignedIn) {
      router.push('/login');
      return;
    }
    if (saved || save.isPending) return;
    save.mutate(filters, {
      onError: (error) =>
        Alert.alert(
          t('savedSearches.save'),
          errorMessage(error, t('savedSearches.saveError'), t('common.networkError')),
        ),
    });
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !isOnline, selected: saved }}
      disabled={!isOnline}
      onPress={onPress}
      hitSlop={8}
      className="flex-row items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 active:opacity-70"
    >
      <Icon size={14} color={colors.fg} strokeWidth={2.25} />
      <Text variant="caption" className="font-body-semibold text-[12px] text-fg">
        {saved ? t('savedSearches.saved') : t('savedSearches.save')}
      </Text>
    </Pressable>
  );
}
