import { CloudOff, Wifi } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useIsOnline } from '@/hooks/use-is-online';
import { palette } from '@/theme';

import { Text } from './text';

const BACK_ONLINE_DURATION = 2500;

/** Global connectivity notice: persistent while offline, a short confirmation when the connection returns. */
export function OfflineBanner() {
  const { t } = useTranslation();
  const isOnline = useIsOnline();
  const insets = useSafeAreaInsets();
  const [previousOnline, setPreviousOnline] = useState(isOnline);
  const [showBackOnline, setShowBackOnline] = useState(false);

  // Derive the transition during render (offline -> online) instead of in an effect.
  if (isOnline !== previousOnline) {
    setPreviousOnline(isOnline);
    setShowBackOnline(isOnline);
  }

  useEffect(() => {
    if (!showBackOnline) return;
    const timer = setTimeout(() => setShowBackOnline(false), BACK_ONLINE_DURATION);
    return () => clearTimeout(timer);
  }, [showBackOnline]);

  if (isOnline && !showBackOnline) return null;

  const offline = !isOnline;
  const Icon = offline ? CloudOff : Wifi;

  return (
    <Animated.View
      entering={FadeInUp.duration(250)}
      exiting={FadeOutUp.duration(250)}
      pointerEvents="none"
      className="absolute left-0 right-0 z-50 items-center px-4"
      style={{ top: insets.top + 6 }}
    >
      <View
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        className={
          offline
            ? 'flex-row items-center gap-2 rounded-full bg-night-900 px-4 py-2.5'
            : 'flex-row items-center gap-2 rounded-full bg-success-600 px-4 py-2.5'
        }
      >
        <Icon size={16} color={palette.white} strokeWidth={2.25} />
        <Text variant="caption" tone="white">
          {offline ? t('network.offline') : t('network.backOnline')}
        </Text>
      </View>
    </Animated.View>
  );
}
