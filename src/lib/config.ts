export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.kegamarket.com/api/v1';

export const SUPPORTED_LOCALES = ['fr', 'en', 'ln'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = 'fr';

export const DEFAULT_CURRENCY = 'USD';
