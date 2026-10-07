import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { DarkTheme, DefaultTheme, ThemeProvider, type Theme } from 'expo-router';
import { useEffect, useMemo, type ReactNode } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { signOutLocally } from '@/hooks/use-session';
import { useApplyThemePreference, useScheme, useThemeColors } from '@/hooks/use-theme';
import i18n, { resolveDeviceLocale } from '@/i18n';
import { configureApiClient } from '@/lib/api/client';
import { connectNetworkManagers, createQueryClient, persistOptions } from '@/lib/query/query-client';
import { useAuthStore } from '@/stores/auth-store';
import { usePreferencesStore } from '@/stores/preferences-store';
import { themeVars } from '@/theme';

const queryClient = createQueryClient();

connectNetworkManagers();
configureApiClient({
  getToken: () => useAuthStore.getState().token,
  getLocale: () => i18n.language,
  onUnauthorized: () => signOutLocally(queryClient),
});

function useSyncLocale() {
  const locale = usePreferencesStore((state) => state.locale);
  useEffect(() => {
    i18n.changeLanguage(locale ?? resolveDeviceLocale());
  }, [locale]);
}

function useNavigationTheme(): Theme {
  const scheme = useScheme();
  const colors = useThemeColors();
  return useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.brand,
        background: colors.canvas,
        card: colors.surface,
        text: colors.fg,
        border: colors.line,
      },
    };
  }, [scheme, colors]);
}

export function AppProviders({ children }: { children: ReactNode }) {
  const scheme = useScheme();
  const navigationTheme = useNavigationTheme();
  useApplyThemePreference();
  useSyncLocale();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={persistOptions}
          onSuccess={() => queryClient.resumePausedMutations()}
        >
          <ThemeProvider value={navigationTheme}>
            <View style={[{ flex: 1 }, themeVars[scheme]]}>{children}</View>
          </ThemeProvider>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
