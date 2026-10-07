import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { MailCheck } from 'lucide-react-native';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AuthNotice, AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/button';
import { Text } from '@/components/text';
import { TextField } from '@/components/text-field';
import { useFormMessages } from '@/hooks/use-form-messages';
import { useIsOnline } from '@/hooks/use-is-online';
import { useForgotPassword } from '@/hooks/use-session';
import { useThemeColors } from '@/hooks/use-theme';
import { errorMessage, isApiError } from '@/lib/api/errors';
import {
  createForgotPasswordSchema,
  type ForgotPasswordForm,
} from '@/screens/register/register-schema';

/** Sends the reset email; the link in it opens the website, where the new password is chosen. */
export function ForgotPassword() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const isOnline = useIsOnline();
  const forgot = useForgotPassword();
  const messages = useFormMessages();

  const schema = useMemo(() => createForgotPasswordSchema(messages), [messages]);
  const { control, handleSubmit, formState } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(({ email }) => {
    if (!forgot.isPending) forgot.mutate(email);
  });

  const emailError =
    formState.errors.email?.message ??
    (isApiError(forgot.error) ? forgot.error.firstFieldError('email') : undefined);
  const serverError =
    forgot.error && !emailError
      ? errorMessage(forgot.error, t('common.genericError'), t('common.networkError'))
      : null;

  return (
    <AuthShell title={t('auth.forgotTitle')} subtitle={t('auth.forgotSubtitle')} back>
      {forgot.isSuccess ? (
        <>
          <View className="mt-8 flex-row items-start gap-3 rounded-2xl bg-surface-muted px-4 py-4">
            <MailCheck size={20} color={colors.fg} />
            <Text variant="callout" className="flex-1">
              {t('auth.forgotSuccess')}
            </Text>
          </View>
          <Button
            title={t('auth.backToLogin')}
            size="lg"
            onPress={() => router.back()}
            className="mt-8"
          />
        </>
      ) : (
        <>
          <View className="mt-8">
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <TextField
                  label={t('auth.email')}
                  placeholder={t('auth.emailPlaceholder')}
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  returnKeyType="send"
                  autoFocus
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  onSubmitEditing={onSubmit}
                  error={emailError}
                />
              )}
            />
          </View>

          {serverError ? <AuthNotice kind="error" message={serverError} /> : null}
          {!isOnline ? <AuthNotice kind="offline" message={t('auth.requiresConnection')} /> : null}

          <Button
            title={t('auth.forgotSubmit')}
            size="lg"
            loading={forgot.isPending}
            disabled={!isOnline}
            onPress={onSubmit}
            className="mt-8"
          />
        </>
      )}
    </AuthShell>
  );
}
