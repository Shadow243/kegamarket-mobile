import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from '@/lib/config';

import { en } from './locales/en';
import { fr } from './locales/fr';
import { ln } from './locales/ln';

export function resolveDeviceLocale(): AppLocale {
  const deviceLanguages = getLocales().map((locale) => locale.languageCode);
  const match = deviceLanguages.find((code): code is AppLocale =>
    SUPPORTED_LOCALES.includes(code as AppLocale),
  );
  return match ?? DEFAULT_LOCALE;
}

export { intlLocale } from './locale';

const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources: { fr: { translation: fr }, en: { translation: en }, ln: { translation: ln } },
  lng: resolveDeviceLocale(),
  fallbackLng: DEFAULT_LOCALE,
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
