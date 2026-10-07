import type { PublicListing } from '@/types/api';

import { toListingCard } from './listing-card';

const base: PublicListing = {
  id: '1',
  reference: 'LK-1',
  title: 'Frigo',
  localized_title: 'Réfrigérateur LG',
  slug: 'refrigerateur-lg',
  price: '340.00',
  compare_at_price: null,
  is_on_sale: false,
  discount_percent: null,
  currency: 'USD',
  city: 'Lubumbashi',
  status: 'active',
  category_name: 'Maison',
  thumbnail_url: 'https://cdn/thumb.jpg',
  photos: [{ url: 'https://cdn/photo.jpg' }],
  is_favorited: false,
  is_boosted: true,
  created_at: new Date().toISOString(),
};

const usd = { code: 'USD', convert: (amount: number) => amount };
const cdf = { code: 'CDF', convert: (amount: number) => amount * 2500 };
const clean = (value?: string) => value?.replace(/\s/g, ' ');

describe('toListingCard', () => {
  it('maps the essentials and prefers the first photo', () => {
    const card = toListingCard(base, 'en', usd);

    expect(card).toMatchObject({
      title: 'Réfrigérateur LG',
      price: '$340',
      city: 'Lubumbashi',
      imageUrl: 'https://cdn/photo.jpg',
      isBoosted: true,
    });
    expect(card.convertedPrice).toBeUndefined();
  });

  it('adds an approximate price in the viewer currency when it differs', () => {
    const card = toListingCard(base, 'en', cdf);

    expect(clean(card.convertedPrice)).toBe('CDF 850,000');
  });

  it('shows the old price and discount only for a real sale', () => {
    const sale = { ...base, is_on_sale: true, compare_at_price: '400.00', discount_percent: 15 };

    expect(toListingCard(sale, 'en', usd)).toMatchObject({ oldPrice: '$400', discount: '-15%' });
    expect(toListingCard(base, 'en', usd).oldPrice).toBeUndefined();
  });

  it('falls back to the thumbnail when there are no photos', () => {
    expect(toListingCard({ ...base, photos: [] }, 'en', usd).imageUrl).toBe('https://cdn/thumb.jpg');
  });
});
