import '@/global.css';
import '@/lib/nativewind-interop';

import { BricolageGrotesque_600SemiBold } from '@expo-google-fonts/bricolage-grotesque/600SemiBold';
import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque/700Bold';
import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque/800ExtraBold';
import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_500Medium } from '@expo-google-fonts/manrope/500Medium';
import { Manrope_600SemiBold } from '@expo-google-fonts/manrope/600SemiBold';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AppProviders } from '@/components/app-providers';
import { OfflineBanner } from '@/components/offline-banner';
import { usePushRegistration, usePushTapRouting } from '@/hooks/use-push-notifications';
import { useScheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';
import { usePreferencesHydrated, usePreferencesStore } from '@/stores/preferences-store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });
  const authReady = useAuthStore((state) => state.status === 'ready');
  const preferencesReady = usePreferencesHydrated();

  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  // Never route on unhydrated state: keep the splash until session and preferences are known.
  const ready = (fontsLoaded || fontError !== null) && authReady && preferencesReady;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <AppProviders>
      <RootStack />
      <OfflineBanner />
    </AppProviders>
  );
}

function RootStack() {
  const scheme = useScheme();
  const hasSeenWelcome = usePreferencesStore((state) => state.hasSeenWelcome);
  const isSignedIn = useAuthStore((state) => state.token !== null);
  usePushRegistration();
  usePushTapRouting();

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!hasSeenWelcome}>
          <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
        </Stack.Protected>
        <Stack.Protected guard={hasSeenWelcome}>
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="listing/[slug]" />
          <Stack.Screen name="login" options={{ presentation: 'modal' }} />
          <Stack.Screen name="account" />
          <Stack.Screen
            name="settings/preference"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: [0.55, 0.95],
              sheetGrabberVisible: true,
              sheetCornerRadius: 28,
            }}
          />
          <Stack.Protected guard={isSignedIn}>
            <Stack.Screen name="settings/profile" />
            <Stack.Screen name="settings/security" />
            <Stack.Screen name="settings/verification" />
            <Stack.Screen name="settings/notifications" />
            <Stack.Screen name="orders/index" />
            <Stack.Screen name="orders/[id]" />
            <Stack.Screen name="saved-searches" />
            <Stack.Screen name="applications" />
            <Stack.Screen name="conversation/[id]" />
            <Stack.Screen name="support" />
          </Stack.Protected>
        </Stack.Protected>
      </Stack>
    </>
  );
}
