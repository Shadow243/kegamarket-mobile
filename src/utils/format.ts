import { intlLocale } from '@/i18n/locale';

/** "18 500 $US" — the listing's own currency, never silently swapped for the viewer's. */
export function formatPrice(amount: string | number, currency: string, locale: string): string {
  const value = typeof amount === 'string' ? Number.parseFloat(amount) : amount;
  try {
    return new Intl.NumberFormat(intlLocale(locale), {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${Math.round(value)} ${currency}`;
  }
}

/** Converts between two currencies through their common base rate; unknown rates leave the amount unchanged. */
export function convertAmount(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
): number {
  if (from === to) return amount;
  const fromRate = rates[from];
  const toRate = rates[to];
  if (!fromRate || !toRate) return amount;
  return (amount / fromRate) * toRate;
}

const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: 'seconds' },
  { amount: 60, unit: 'minutes' },
  { amount: 24, unit: 'hours' },
  { amount: 7, unit: 'days' },
  { amount: 4.34524, unit: 'weeks' },
  { amount: 12, unit: 'months' },
  { amount: Number.POSITIVE_INFINITY, unit: 'years' },
];

/** "il y a 2 h" / "2 hours ago". */
export function formatTimeAgo(isoDate: string, locale: string, now: number = Date.now()): string {
  let duration = (new Date(isoDate).getTime() - now) / 1000;
  const rtf = new Intl.RelativeTimeFormat(intlLocale(locale), { numeric: 'auto' });

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) return rtf.format(Math.round(duration), division.unit);
    duration /= division.amount;
  }
  return rtf.format(Math.round(duration), 'years');
}

/** "septembre 2026" */
export function formatMonthYear(isoDate: string, locale: string): string {
  return new Intl.DateTimeFormat(intlLocale(locale), { month: 'long', year: 'numeric' }).format(
    new Date(isoDate),
  );
}

/** "Maison & Jardin" → "MJ", for avatar placeholders. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word));
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
