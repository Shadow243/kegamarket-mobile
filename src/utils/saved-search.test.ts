import { describeSavedSearch, savedSearchParams } from './saved-search';

describe('savedSearchParams', () => {
  it('maps text and category to the search screen params', () => {
    expect(savedSearchParams({ search: 'frigo', category: 'electronique', price_min: 10 })).toEqual(
      {
        q: 'frigo',
        category: 'electronique',
      },
    );
  });

  it('omits filters that are not set', () => {
    expect(savedSearchParams({})).toEqual({});
  });
});

describe('describeSavedSearch', () => {
  it('joins the meaningful filters', () => {
    expect(
      describeSavedSearch({ search: 'frigo', category: 'maison', city: ['Kinshasa', 'Goma'] }),
    ).toBe('frigo · maison · Kinshasa · Goma');
    expect(describeSavedSearch({ city: 'Lubumbashi' })).toBe('Lubumbashi');
  });
});
