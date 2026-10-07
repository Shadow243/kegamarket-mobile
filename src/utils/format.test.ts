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
    expect(formatTimeAgo('2026-10-07T10:00:00Z', 'en', now)).toBe('2 hours ago');
    expect(formatTimeAgo('2026-10-06T12:00:00Z', 'en', now)).toBe('yesterday');
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
