import type { CategoryAttribute } from '@/types/api';

export interface ListingSpec {
  key: string;
  label: string;
  value: string;
}

/**
 * Turns a listing's raw attributes ({ condition: 'used' }) into labelled rows ("État" / "Occasion")
 * using its category's attribute definitions. Attributes the category no longer defines are skipped.
 */
export function listingSpecs(
  attributes: Record<string, string | number | boolean> | null | undefined,
  definitions: CategoryAttribute[] | undefined,
  words: { yes: string; no: string },
): ListingSpec[] {
  if (!attributes || !definitions) return [];

  return definitions.flatMap((definition) => {
    const raw = attributes[definition.key];
    if (raw === undefined || raw === null || raw === '') return [];

    let value: string;
    if (definition.type === 'boolean' || typeof raw === 'boolean') {
      value = raw === true || raw === 'true' || raw === 1 || raw === '1' ? words.yes : words.no;
    } else if (definition.type === 'select') {
      value =
        definition.options?.find((option) => option.value === String(raw))?.label ?? String(raw);
    } else {
      value = definition.unit ? `${raw} ${definition.unit}` : String(raw);
    }

    return [{ key: definition.key, label: definition.label, value }];
  });
}
