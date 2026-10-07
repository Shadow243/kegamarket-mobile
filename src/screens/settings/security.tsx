import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { FormMessage } from '@/components/form-message';
import { ScreenHeader } from '@/components/screen-header';
import { TextField } from '@/components/text-field';
import { useIsOnline } from '@/hooks/use-is-online';
import { useUpdatePassword } from '@/hooks/use-profile';
import { formLevelError, isApiError } from '@/lib/api/errors';

import { createPasswordSchema, type PasswordForm } from './schemas';
import { useFormMessages } from './use-form-messages';

const EMPTY: PasswordForm = { current_password: '', password: '', password_confirmation: '' };

export function SecuritySettings() {
  const { t } = useTranslation();
  const isOnline = useIsOnline();
  const updatePassword = useUpdatePassword();
  const messages = useFormMessages();

  const { control, handleSubmit, formState, reset } = useForm<PasswordForm>({
    resolver: zodResolver(createPasswordSchema(messages)),
    defaultValues: EMPTY,
  });

  const onSubmit = handleSubmit((values) => {
    if (updatePassword.isPending) return;
    updatePassword.mutate(values, { onSuccess: () => reset(EMPTY) });
  });

  const fieldError = (field: keyof PasswordForm) =>
    formState.errors[field]?.message ??
    (isApiError(updatePassword.error) ? updatePassword.error.firstFieldError(field) : undefined);
  const generalError = formLevelError(
    updatePassword.error,
    t('common.genericError'),
    t('common.networkError'),
  );

  const fields: {
    name: keyof PasswordForm;
    label: string;
    autoComplete: 'current-password' | 'new-password';
  }[] = [
    {
      name: 'current_password',
      label: t('settings.currentPassword'),
      autoComplete: 'current-password',
    },
    { name: 'password', label: t('settings.newPassword'), autoComplete: 'new-password' },
    {
      name: 'password_confirmation',
      label: t('settings.confirmNewPassword'),
      autoComplete: 'new-password',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <ScreenHeader title={t('settings.security')} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="px-5 pb-10 pt-4">
          <View className="gap-5">
            {fields.map(({ name, label, autoComplete }) => (
              <Controller
                key={name}
                control={control}
                name={name}
                render={({ field }) => (
                  <TextField
                    label={label}
                    secureTextEntry
                    autoComplete={autoComplete}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldError(name)}
                  />
                )}
              />
            ))}
          </View>

          <View className="mt-6 gap-3">
            {updatePassword.isSuccess ? (
              <FormMessage type="success" message={t('settings.passwordUpdated')} />
            ) : null}
            {generalError ? <FormMessage type="error" message={generalError} /> : null}
            {!isOnline ? (
              <FormMessage type="error" message={t('settings.requiresConnection')} />
            ) : null}
          </View>

          <Button
            title={t('settings.updatePassword')}
            size="lg"
            loading={updatePassword.isPending}
            disabled={!isOnline}
            onPress={onSubmit}
            className="mt-6"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
