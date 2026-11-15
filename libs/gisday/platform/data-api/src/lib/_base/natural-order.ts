/**
 * Text in the order a person expects a list to be in: case and accents ignored, and numbers compared as numbers, so
 * "Zoom 2" comes before "Zoom 10". A database's ORDER BY compares numbers as text.
 */
export const naturalOrder = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

/**
 * Rows by name in natural order (#3047), ignoring spaces at either end; a row with no name goes last. Sorts a copy.
 */
export function byName<T extends { name?: string | null }>(rows: Array<T>): Array<T> {
  return [...(rows ?? [])].sort((a, b) => {
    const left = (a?.name ?? '').trim();
    const right = (b?.name ?? '').trim();

    if (!left || !right) {
      return left ? -1 : right ? 1 : 0;
    }

    return naturalOrder.compare(left, right);
  });
}
