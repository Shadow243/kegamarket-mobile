import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { FormMessage } from '@/components/form-message';
import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/text';
import { TextField } from '@/components/text-field';
import { useIsOnline } from '@/hooks/use-is-online';
import { useUpdateAvatar, useUpdateProfile } from '@/hooks/use-profile';
import { useCurrentUser } from '@/hooks/use-session';
import { formLevelError, isApiError } from '@/lib/api/errors';
import { palette } from '@/theme';
import { initials } from '@/utils/format';

import { createProfileSchema, type ProfileForm } from './schemas';
import { useFormMessages } from './use-form-messages';

export function ProfileSettings() {
  const { t } = useTranslation();
  const { user } = useCurrentUser();
  const isOnline = useIsOnline();
  const updateProfile = useUpdateProfile();
  const updateAvatar = useUpdateAvatar();
  const messages = useFormMessages();

  const { control, handleSubmit, formState, reset } = useForm<ProfileForm>({
    resolver: zodResolver(createProfileSchema(messages)),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '' },
  });

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email, phone: user.phone });
  }, [user, reset]);

  if (!user) return null;

  const onSubmit = handleSubmit((values) => {
    if (updateProfile.isPending) return;
    updateProfile.mutate({ ...values, locale: user.locale });
  });

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('settings.changeAvatar'), t('settings.photoPermission'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled) updateAvatar.mutate(result.assets[0].uri);
  };

  const generalError = formLevelError(
    updateProfile.error,
    t('common.genericError'),
    t('common.networkError'),
  );

  const fieldError = (field: keyof ProfileForm) =>
    formState.errors[field]?.message ??
    (isApiError(updateProfile.error) ? updateProfile.error.firstFieldError(field) : undefined);

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <ScreenHeader title={t('settings.personalInfo')} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="px-5 pb-10 pt-4">
          <View className="items-center">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('settings.changeAvatar')}
              onPress={pickAvatar}
              disabled={!isOnline || updateAvatar.isPending}
              className="active:opacity-80"
            >
              {user.avatar_url ? (
                <Image
                  source={user.avatar_url}
                  className="h-28 w-28 rounded-full"
                  contentFit="cover"
                />
              ) : (
                <View className="h-28 w-28 items-center justify-center rounded-full bg-night-900">
                  <Text variant="display" tone="white">
                    {initials(user.name)}
                  </Text>
                </View>
              )}
              <View className="absolute bottom-0 right-0 h-10 w-10 items-center justify-center rounded-full border-4 border-canvas bg-accent-400">
                {updateAvatar.isPending ? (
                  <ActivityIndicator size="small" color={palette.primary[950]} />
                ) : (
                  <Camera size={16} color={palette.primary[950]} strokeWidth={2.25} />
                )}
              </View>
            </Pressable>
            <Text variant="caption" tone="muted" className="mt-3">
              {t('settings.changeAvatar')}
            </Text>
          </View>

          {updateAvatar.isError ? (
            <View className="mt-4">
              <FormMessage type="error" message={t('settings.avatarError')} />
            </View>
          ) : null}

          <View className="mt-8 gap-5">
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <TextField
                  label={t('settings.fullName')}
                  autoComplete="name"
                  textContentType="name"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldError('name')}
                />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <TextField
                  label={t('settings.email')}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldError('email')}
                />
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <TextField
                  label={t('settings.phone')}
                  autoComplete="tel"
                  keyboardType="phone-pad"
                  textContentType="telephoneNumber"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldError('phone')}
                />
              )}
            />
          </View>

          <View className="mt-6 gap-3">
            {updateProfile.isSuccess && !formState.isDirty ? (
              <FormMessage type="success" message={t('settings.saved')} />
            ) : null}
            {generalError ? <FormMessage type="error" message={generalError} /> : null}
            {!isOnline ? (
              <FormMessage type="error" message={t('settings.requiresConnection')} />
            ) : null}
          </View>

          <Button
            title={t('settings.save')}
            size="lg"
            loading={updateProfile.isPending}
            disabled={!isOnline}
            onPress={onSubmit}
            className="mt-6"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
