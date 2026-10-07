import { Car, Tag } from 'lucide-react-native';

import { categoryIcon } from './category-icon';

describe('categoryIcon', () => {
  it('maps a known Heroicons name', () => {
    expect(categoryIcon('car')).toBe(Car);
  });

  it('falls back to a tag for unknown or missing icons', () => {
    expect(categoryIcon('rocket')).toBe(Tag);
    expect(categoryIcon(null)).toBe(Tag);
  });
});
