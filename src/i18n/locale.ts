/** Intl has no Lingala data on most devices: format numbers and dates in French for it. */
export function intlLocale(locale: string): string {
  return locale === 'ln' ? 'fr' : locale;
}
