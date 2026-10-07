import { convertAmount, formatPrice, formatTimeAgo, initials } from './format';

const normalizeSpaces = (value: string) => value.replace(/\s/g, ' ');

describe('formatPrice', () => {
  it('formats in the listing currency without decimals', () => {
    expect(normalizeSpaces(formatPrice('18500.00', 'USD', 'en'))).toBe('$18,500');
  });

  it('formats Lingala like French', () => {
    expect(normalizeSpaces(formatPrice(340, 'USD', 'ln'))).toBe(
      normalizeSpaces(formatPrice(340, 'USD', 'fr')),
    );
  });

  it('falls back to a plain label for an unknown currency code', () => {
    expect(formatPrice(10, 'NOT-A-CODE', 'fr')).toBe('10 NOT-A-CODE');
  });
});

describe('convertAmount', () => {
  const rates = { USD: 1, CDF: 2500, EUR: 0.9 };

  it('converts through the base rate', () => {
    expect(convertAmount(5000, 'CDF', 'USD', rates)).toBe(2);
    expect(convertAmount(10, 'USD', 'EUR', rates)).toBeCloseTo(9);
  });

  it('leaves the amount unchanged for the same or an unknown currency', () => {
    expect(convertAmount(10, 'USD', 'USD', rates)).toBe(10);
    expect(convertAmount(10, 'USD', 'XYZ', rates)).toBe(10);
  });
});

describe('formatTimeAgo', () => {
  const now = new Date('2026-10-07T12:00:00Z').getTime();

  it('describes recent dates relative to now', () => {
    expect(formatTimeAgo('2026-10-07T11:59:30Z', 'fr', now)).toBe('à l’instant');
    expect(formatTimeAgo('2026-10-07T10:00:00Z', 'fr', now)).toBe('il y a 2 h');
    expect(formatTimeAgo('2026-10-06T12:00:00Z', 'en', now)).toBe('yesterday');
    expect(formatTimeAgo('2026-09-07T12:00:00Z', 'ln', now)).toBe('sanza 1 eleki');
  });

  it('does not rely on Intl.RelativeTimeFormat, which Hermes lacks', () => {
    const original = Intl.RelativeTimeFormat;
    Object.defineProperty(Intl, 'RelativeTimeFormat', { value: undefined, configurable: true });
    try {
      expect(formatTimeAgo('2026-10-04T12:00:00Z', 'fr', now)).toBe('il y a 3 j');
    } finally {
      Object.defineProperty(Intl, 'RelativeTimeFormat', { value: original, configurable: true });
    }
  });

  it('falls back to French for an unknown locale and never goes negative', () => {
    expect(formatTimeAgo('2026-10-08T12:00:00Z', 'de', now)).toBe('à l’instant');
  });
});

describe('initials', () => {
  it('takes the first letter of the first two words', () => {
    expect(initials('Maison Confort RDC')).toBe('MC');
    expect(initials('Maison & Jardin')).toBe('MJ');
  });

  it('handles single words and empty names', () => {
    expect(initials('kega')).toBe('KE');
    expect(initials('  ')).toBe('?');
  });
});
