import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { CircleAlert, CloudOff, X } from 'lucide-react-native';
import { useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { IconButton } from '@/components/icon-button';
import { Text } from '@/components/text';
import { TextField } from '@/components/text-field';
import { useIsOnline } from '@/hooks/use-is-online';
import { useLogin } from '@/hooks/use-session';
import { useScheme, useThemeColors } from '@/hooks/use-theme';
import { errorMessage, isApiError } from '@/lib/api/errors';
import { SITE_URL } from '@/lib/config';

import { createLoginSchema, type LoginForm } from './login-schema';

const logos = {
  light: require('@/assets/images/logo-kega.png'),
  dark: require('@/assets/images/logo-kega-light.png'),
};

export function Login() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const scheme = useScheme();
  const colors = useThemeColors();
  const isOnline = useIsOnline();
  const login = useLogin();
  const passwordRef = useRef<TextInput>(null);

  const schema = useMemo(() => createLoginSchema(t('auth.required')), [t]);
  const { control, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { login: '', password: '' },
  });

  const onSubmit = handleSubmit((values) => {
    if (login.isPending) return;
    login.mutate(values, { onSuccess: () => router.back() });
  });

  const serverError = login.error
    ? errorMessage(login.error, t('auth.invalidCredentials'), t('common.networkError'))
    : null;
  const fieldError = (field: keyof LoginForm) =>
    formState.errors[field]?.message ??
    (isApiError(login.error) ? login.error.firstFieldError(field) : undefined);

  const openWeb = (path: string) =>
    WebBrowser.openBrowserAsync(
      `${SITE_URL}${i18n.language === 'fr' ? '' : `/${i18n.language}`}${path}`,
    );

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-row justify-end px-5 pt-2">
          <IconButton
            icon={X}
            variant="muted"
            accessibilityLabel={t('common.close')}
            onPress={() => router.back()}
          />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow px-6 pb-8"
        >
          <Image
            source={logos[scheme]}
            className="mt-4 h-8 w-[110px]"
            contentFit="contain"
            accessibilityLabel="Kega"
          />
          <Text variant="display" accessibilityRole="header" className="mt-8">
            {t('auth.loginTitle')}
          </Text>
          <Text tone="muted" className="mt-2">
            {t('auth.loginSubtitle')}
          </Text>

          <View className="mt-8 gap-5">
            <Controller
              control={control}
              name="login"
              render={({ field }) => (
                <TextField
                  label={t('auth.phoneOrEmail')}
                  placeholder={t('auth.phoneOrEmailPlaceholder')}
                  autoCapitalize="none"
                  autoComplete="username"
                  textContentType="username"
                  keyboardType="email-address"
                  returnKeyType="next"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  error={fieldError('login')}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <TextField
                  ref={passwordRef}
                  label={t('auth.password')}
                  secureTextEntry
                  autoComplete="current-password"
                  textContentType="password"
                  returnKeyType="go"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  onSubmitEditing={onSubmit}
                  error={fieldError('password')}
                />
              )}
            />
            <Pressable
              accessibilityRole="link"
              onPress={() => openWeb('/forgot-password')}
              className="self-end active:opacity-60"
            >
              <Text variant="caption" className="font-body-semibold text-fg">
                {t('auth.forgotPassword')}
              </Text>
            </Pressable>
          </View>

          {serverError ? (
            <View
              accessibilityRole="alert"
              className="mt-6 flex-row items-center gap-3 rounded-2xl bg-surface-muted px-4 py-3"
            >
              <CircleAlert size={18} color={colors['danger-fg']} />
              <Text variant="caption" tone="danger" className="flex-1">
                {serverError}
              </Text>
            </View>
          ) : null}

          {!isOnline ? (
            <View className="mt-6 flex-row items-center gap-3 rounded-2xl bg-surface-muted px-4 py-3">
              <CloudOff size={18} color={colors['fg-muted']} />
              <Text variant="caption" tone="muted" className="flex-1">
                {t('auth.loginRequiresConnection')}
              </Text>
            </View>
          ) : null}

          <View className="flex-1" />

          <Button
            title={t('auth.login')}
            size="lg"
            loading={login.isPending}
            disabled={!isOnline}
            onPress={onSubmit}
            className="mt-8"
          />
          <View className="mt-5 flex-row justify-center gap-1">
            <Text variant="caption" tone="muted">
              {t('auth.noAccount')}
            </Text>
            <Pressable accessibilityRole="link" onPress={() => openWeb('/register')} hitSlop={8}>
              <Text variant="caption" className="font-body-bold text-fg underline">
                {t('auth.createAccount')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
