import { useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';

import { usePreferencesStore } from '@/stores/preferences-store';
import { semantic, type ColorScheme } from '@/theme';

/** Applies the user's appearance choice to the whole app, native controls included. */
export function useApplyThemePreference() {
  const theme = usePreferencesStore((state) => state.theme);
  useEffect(() => {
    Appearance.setColorScheme(theme === 'system' ? 'unspecified' : theme);
  }, [theme]);
}

export function useScheme(): ColorScheme {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}

/** Raw color values for places classes can't reach: icons, navigators, status bar. */
export function useThemeColors() {
  return semantic[useScheme()];
}
