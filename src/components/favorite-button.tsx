import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { useToggleFavorite } from '@/hooks/use-listings';
import { useAuthStore } from '@/stores/auth-store';
import { palette } from '@/theme';

import { IconButton } from './icon-button';

export function FavoriteButton({
  listingId,
  favorited,
  size = 34,
  variant = 'floating',
}: {
  listingId: string;
  favorited: boolean;
  size?: number;
  variant?: 'floating' | 'surface';
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const isSignedIn = useAuthStore((state) => state.token !== null);
  const { mutate } = useToggleFavorite();

  function onPress() {
    if (!isSignedIn) {
      router.push('/login');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    mutate({ id: listingId, favorited: !favorited });
  }

  return (
    <IconButton
      icon={Heart}
      variant={variant}
      size={size}
      filled={favorited}
      color={favorited ? palette.danger[500] : undefined}
      accessibilityLabel={favorited ? t('common.removeFromFavorites') : t('common.addToFavorites')}
      accessibilityState={{ selected: favorited }}
      onPress={onPress}
    />
  );
}
