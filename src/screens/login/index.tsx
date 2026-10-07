import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { AuthNotice, AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/button';
import { Text } from '@/components/text';
import { TextField } from '@/components/text-field';
import { useIsOnline } from '@/hooks/use-is-online';
import { useLogin } from '@/hooks/use-session';
import { errorMessage, isApiError } from '@/lib/api/errors';

import { createLoginSchema, type LoginForm } from './login-schema';

export function Login() {
  const { t } = useTranslation();
  const router = useRouter();
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

  return (
    <AuthShell title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')}>
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
          onPress={() => router.push('/forgot-password')}
          className="self-end active:opacity-60"
        >
          <Text variant="caption" className="font-body-semibold text-fg">
            {t('auth.forgotPassword')}
          </Text>
        </Pressable>
      </View>

      {serverError ? <AuthNotice kind="error" message={serverError} /> : null}
      {!isOnline ? <AuthNotice kind="offline" message={t('auth.loginRequiresConnection')} /> : null}

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
        <Pressable accessibilityRole="link" onPress={() => router.replace('/register')} hitSlop={8}>
          <Text variant="caption" className="font-body-bold text-fg underline">
            {t('auth.createAccount')}
          </Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}
