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

type TimeUnit = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

// Hermes ships no Intl.RelativeTimeFormat, so relative times are formatted by hand.
const RELATIVE_TIME: Record<string, { now: string; yesterday: string } & Record<TimeUnit, string>> =
  {
    fr: {
      now: 'à l’instant',
      yesterday: 'hier',
      minute: 'il y a {n} min',
      hour: 'il y a {n} h',
      day: 'il y a {n} j',
      week: 'il y a {n} sem.',
      month: 'il y a {n} mois',
      year: 'il y a {n} an',
    },
    en: {
      now: 'just now',
      yesterday: 'yesterday',
      minute: '{n} min ago',
      hour: '{n} h ago',
      day: '{n} d ago',
      week: '{n} wk ago',
      month: '{n} mo ago',
      year: '{n} yr ago',
    },
    ln: {
      now: 'sikoyo',
      yesterday: 'lobi',
      minute: 'miniti {n} eleki',
      hour: 'ngonga {n} eleki',
      day: 'mikolo {n} eleki',
      week: 'poso {n} eleki',
      month: 'sanza {n} eleki',
      year: 'mibu {n} eleki',
    },
  };

const UNITS: { unit: TimeUnit; seconds: number }[] = [
  { unit: 'year', seconds: 365 * 24 * 3600 },
  { unit: 'month', seconds: 30 * 24 * 3600 },
  { unit: 'week', seconds: 7 * 24 * 3600 },
  { unit: 'day', seconds: 24 * 3600 },
  { unit: 'hour', seconds: 3600 },
  { unit: 'minute', seconds: 60 },
];

/** "il y a 2 h" / "2 h ago". */
export function formatTimeAgo(isoDate: string, locale: string, now: number = Date.now()): string {
  const words = RELATIVE_TIME[locale] ?? RELATIVE_TIME.fr;
  const elapsed = Math.max(0, (now - new Date(isoDate).getTime()) / 1000);

  for (const { unit, seconds } of UNITS) {
    const count = Math.floor(elapsed / seconds);
    if (count < 1) continue;
    if (unit === 'day' && count === 1) return words.yesterday;
    return words[unit].replace('{n}', String(count));
  }
  return words.now;
}

/** "septembre 2026" */
export function formatMonthYear(isoDate: string, locale: string): string {
  return new Intl.DateTimeFormat(intlLocale(locale), { month: 'long', year: 'numeric' }).format(
    new Date(isoDate),
  );
}

/** "Maison & Jardin" → "MJ", for avatar placeholders. */
export function initials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => /[\p{L}\p{N}]/u.test(word));
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
