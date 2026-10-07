import type { CategoryAttribute } from '@/types/api';

import { listingSpecs } from './listing-specs';

const definition = (overrides: Partial<CategoryAttribute>): CategoryAttribute => ({
  id: overrides.key ?? 'id',
  key: 'key',
  type: 'text',
  options: null,
  unit: null,
  label: 'Label',
  ...overrides,
});

const words = { yes: 'Oui', no: 'Non' };

const definitions = [
  definition({
    key: 'condition',
    type: 'select',
    label: 'État',
    options: [
      { value: 'new', label: 'Neuf' },
      { value: 'used', label: 'Occasion' },
    ],
  }),
  definition({ key: 'surface', type: 'number', label: 'Surface', unit: 'm²' }),
  definition({ key: 'furnished', type: 'boolean', label: 'Meublé' }),
  definition({ key: 'brand', label: 'Marque' }),
];

describe('listingSpecs', () => {
  it('labels select, number, boolean and text attributes in category order', () => {
    const specs = listingSpecs(
      { brand: 'LG', furnished: false, surface: 120, condition: 'used' },
      definitions,
      words,
    );

    expect(specs.map(({ label, value }) => [label, value])).toEqual([
      ['État', 'Occasion'],
      ['Surface', '120 m²'],
      ['Meublé', 'Non'],
      ['Marque', 'LG'],
    ]);
  });

  it('skips empty values and attributes the category does not define', () => {
    expect(listingSpecs({ brand: '', color: 'red' }, definitions, words)).toEqual([]);
  });

  it('keeps an unknown select value as-is', () => {
    expect(listingSpecs({ condition: 'refurbished' }, definitions, words)[0].value).toBe(
      'refurbished',
    );
  });

  it('returns nothing without attributes or definitions', () => {
    expect(listingSpecs(null, definitions, words)).toEqual([]);
    expect(listingSpecs({ brand: 'LG' }, undefined, words)).toEqual([]);
  });
});
