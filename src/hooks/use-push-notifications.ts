import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useIsOnline } from '@/hooks/use-is-online';
import { devicesApi } from '@/lib/api/endpoints';
import { getPushToken } from '@/lib/push';
import { useAuthStore } from '@/stores/auth-store';
import { pushRoute } from '@/utils/push-route';

let registeredToken: string | null = null;

/** Tells the API which phone to push to, once per session (and again after a login). */
export function usePushRegistration() {
  const isSignedIn = useAuthStore((state) => state.token !== null);
  const isOnline = useIsOnline();

  useEffect(() => {
    if (!isSignedIn) {
      registeredToken = null;
      return;
    }
    if (!isOnline || registeredToken !== null) return;
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;

    getPushToken()
      .then(async (token) => {
        if (!token) {
          if (__DEV__) console.warn('[push] no token: permission denied or not a physical device');
          return;
        }
        await devicesApi.register(token, Platform.OS as 'ios' | 'android');
        registeredToken = token;
        if (__DEV__) console.log('[push] device registered', token);
      })
      .catch((error: unknown) => {
        if (__DEV__) console.warn('[push] registration failed', error);
      });
  }, [isSignedIn, isOnline]);
}

/** Must run while still signed in: the API only removes tokens of the current user. */
export async function unregisterPushDevice() {
  if (!registeredToken) return;
  const token = registeredToken;
  registeredToken = null;
  await devicesApi.unregister(token).catch(() => {});
}

/** Opens the screen a tapped push points to, including the one that cold-started the app. */
export function usePushTapRouting() {
  const response = Notifications.useLastNotificationResponse();
  const isSignedIn = useAuthStore((state) => state.token !== null);

  useEffect(() => {
    if (!response || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;

    const route = isSignedIn ? pushRoute(response.notification.request.content.data) : null;
    if (route) router.push(route);
    Notifications.clearLastNotificationResponseAsync();
  }, [response, isSignedIn]);
}
