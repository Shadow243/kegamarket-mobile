export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.kegamarket.com/api/v1';

export const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL ?? 'https://kegamarket.com';

export const SUPPORTED_LOCALES = ['fr', 'en', 'ln'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = 'fr';

export const DEFAULT_CURRENCY = 'USD';

export const REVERB = {
  key: process.env.EXPO_PUBLIC_REVERB_APP_KEY ?? '',
  host: process.env.EXPO_PUBLIC_REVERB_HOST ?? '',
  port: Number(process.env.EXPO_PUBLIC_REVERB_PORT ?? 443),
  scheme: process.env.EXPO_PUBLIC_REVERB_SCHEME ?? 'https',
};
