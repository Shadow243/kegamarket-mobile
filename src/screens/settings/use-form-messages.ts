import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useFormMessages() {
  const { t } = useTranslation();
  return useMemo(
    () => ({
      required: t('auth.required'),
      invalidEmail: t('settings.invalidEmail'),
      tooShort: t('settings.passwordTooShort'),
      mismatch: t('settings.passwordMismatch'),
    }),
    [t],
  );
}
