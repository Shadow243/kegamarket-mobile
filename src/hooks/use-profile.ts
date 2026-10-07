import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { profileApi, type PasswordPayload, type ProfilePayload } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import type { AuthUser, NotificationPreferences } from '@/types/api';

const AVATAR_SIZE = 512;

function useSetUser() {
  const queryClient = useQueryClient();
  return ({ user }: { user: AuthUser }) => queryClient.setQueryData(queryKeys.me(), user);
}

export function useUpdateProfile() {
  const setUser = useSetUser();
  return useMutation({
    mutationFn: (payload: ProfilePayload) => profileApi.update(payload),
    onSuccess: setUser,
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (payload: PasswordPayload) => profileApi.updatePassword(payload),
  });
}

/** Shrinks the picked photo first: the API caps avatars at 2 MB and phones shoot far larger. */
export function useUpdateAvatar() {
  const setUser = useSetUser();
  return useMutation({
    mutationFn: async (uri: string) => {
      const image = await ImageManipulator.manipulate(uri)
        .resize({ width: AVATAR_SIZE, height: AVATAR_SIZE })
        .renderAsync();
      const resized = await image.saveAsync({ compress: 0.8, format: SaveFormat.JPEG });
      const form = new FormData();
      form.append('avatar', { uri: resized.uri, name: 'avatar.jpg', type: 'image/jpeg' } as never);
      return profileApi.updateAvatar(form);
    },
    onSuccess: setUser,
  });
}

/** Optimistic: the switch flips immediately and reverts if the server refuses. */
export function useUpdateNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (preferences: Partial<NotificationPreferences>) =>
      profileApi.updateNotifications(preferences),
    onMutate: (preferences) => {
      const previous = queryClient.getQueryData<AuthUser>(queryKeys.me());
      if (previous) {
        queryClient.setQueryData(queryKeys.me(), {
          ...previous,
          notification_preferences: { ...previous.notification_preferences, ...preferences },
        });
      }
      return { previous };
    },
    onError: (_error, _preferences, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.me(), context.previous);
    },
    onSuccess: ({ user }) => queryClient.setQueryData(queryKeys.me(), user),
  });
}

export function useSyncProfileLocale() {
  const setUser = useSetUser();
  return useMutation({
    mutationFn: (locale: string) => profileApi.updateLocale(locale),
    onSuccess: setUser,
  });
}
