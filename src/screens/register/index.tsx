import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { AuthNotice, AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { Text } from '@/components/text';
import { TextField } from '@/components/text-field';
import { useFormMessages } from '@/hooks/use-form-messages';
import { useIsOnline } from '@/hooks/use-is-online';
import { useRegister } from '@/hooks/use-session';
import { useThemeColors } from '@/hooks/use-theme';
import { errorMessage, isApiError } from '@/lib/api/errors';
import { openSitePage } from '@/lib/site';
import { cn } from '@/utils/cn';

import { createRegisterSchema, type RegisterForm } from './register-schema';

const ACCOUNT_TYPES = [
  { value: 'particulier', label: 'auth.individual' },
  { value: 'professionnel', label: 'auth.professional' },
] as const;

export function Register() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const isOnline = useIsOnline();
  const register = useRegister();
  const messages = useFormMessages();
  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const schema = useMemo(
    () => createRegisterSchema({ ...messages, mustAcceptTerms: t('auth.mustAcceptTerms') }),
    [messages, t],
  );
  const { control, handleSubmit, formState } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      account_type: 'particulier',
      name: '',
      phone: '',
      email: '',
      password: '',
      password_confirmation: '',
      terms_accepted: false,
    },
  });

  const onSubmit = handleSubmit((values) => {
    if (register.isPending) return;
    register.mutate(values, { onSuccess: () => router.back() });
  });

  const fieldError = (field: keyof RegisterForm) =>
    formState.errors[field]?.message ??
    (isApiError(register.error) ? register.error.firstFieldError(field) : undefined);
  // Field-level validation errors are shown under each field; only surface the rest here.
  const serverError =
    register.error && !(isApiError(register.error) && register.error.status === 422)
      ? errorMessage(register.error, t('auth.registerFailed'), t('common.networkError'))
      : null;

  return (
    <AuthShell title={t('auth.registerTitle')} subtitle={t('auth.registerSubtitle')}>
      <View className="mt-8 gap-5">
        <Controller
          control={control}
          name="account_type"
          render={({ field }) => (
            <View accessibilityRole="radiogroup" accessibilityLabel={t('auth.accountType')}>
              <View className="flex-row gap-2">
                {ACCOUNT_TYPES.map((type) => (
                  <Chip
                    key={type.value}
                    label={t(type.label)}
                    selected={field.value === type.value}
                    onPress={() => field.onChange(type.value)}
                  />
                ))}
              </View>
            </View>
          )}
        />
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <TextField
              label={t('auth.fullName')}
              placeholder={t('auth.fullNamePlaceholder')}
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              onSubmitEditing={() => phoneRef.current?.focus()}
              error={fieldError('name')}
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <TextField
              ref={phoneRef}
              label={t('auth.phone')}
              placeholder={t('auth.phonePlaceholder')}
              autoComplete="tel"
              textContentType="telephoneNumber"
              keyboardType="phone-pad"
              returnKeyType="next"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              onSubmitEditing={() => emailRef.current?.focus()}
              error={fieldError('phone')}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <TextField
              ref={emailRef}
              label={t('auth.email')}
              placeholder={t('auth.emailPlaceholder')}
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              keyboardType="email-address"
              returnKeyType="next"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              onSubmitEditing={() => passwordRef.current?.focus()}
              error={fieldError('email')}
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
              placeholder={t('auth.passwordHint')}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              onSubmitEditing={() => confirmRef.current?.focus()}
              error={fieldError('password')}
            />
          )}
        />
        <Controller
          control={control}
          name="password_confirmation"
          render={({ field }) => (
            <TextField
              ref={confirmRef}
              label={t('auth.confirmPassword')}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldError('password_confirmation')}
            />
          )}
        />
        <Controller
          control={control}
          name="terms_accepted"
          render={({ field }) => (
            <View className="gap-1.5">
              <View className="flex-row items-start gap-3">
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: field.value }}
                  accessibilityLabel={t('auth.mustAcceptTerms')}
                  hitSlop={8}
                  onPress={() => field.onChange(!field.value)}
                  className={cn(
                    'mt-0.5 h-6 w-6 items-center justify-center rounded-lg border-[1.5px]',
                    field.value ? 'border-action bg-action' : 'border-line-strong bg-surface',
                  )}
                >
                  {field.value ? (
                    <Check size={15} color={colors['on-action']} strokeWidth={3} />
                  ) : null}
                </Pressable>
                <Text variant="caption" tone="muted" className="flex-1">
                  {t('auth.acceptTermsPrefix')}
                  <Text
                    variant="caption"
                    accessibilityRole="link"
                    className="font-body-semibold text-fg underline"
                    onPress={() => openSitePage('/terms')}
                  >
                    {t('auth.termsLink')}
                  </Text>
                  {t('auth.acceptTermsAnd')}
                  <Text
                    variant="caption"
                    accessibilityRole="link"
                    className="font-body-semibold text-fg underline"
                    onPress={() => openSitePage('/privacy')}
                  >
                    {t('auth.privacyLink')}
                  </Text>
                  .
                </Text>
              </View>
              {fieldError('terms_accepted') ? (
                <Text variant="caption" tone="danger">
                  {fieldError('terms_accepted')}
                </Text>
              ) : null}
            </View>
          )}
        />
      </View>

      {serverError ? <AuthNotice kind="error" message={serverError} /> : null}
      {!isOnline ? <AuthNotice kind="offline" message={t('auth.requiresConnection')} /> : null}

      <Button
        title={t('auth.register')}
        size="lg"
        loading={register.isPending}
        disabled={!isOnline}
        onPress={onSubmit}
        className="mt-8"
      />
      <View className="mt-5 flex-row justify-center gap-1">
        <Text variant="caption" tone="muted">
          {t('auth.haveAccount')}
        </Text>
        <Pressable accessibilityRole="link" onPress={() => router.replace('/login')} hitSlop={8}>
          <Text variant="caption" className="font-body-bold text-fg underline">
            {t('auth.login')}
          </Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}
