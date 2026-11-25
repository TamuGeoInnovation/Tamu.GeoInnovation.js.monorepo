/**
 * A person's last name, for sorting, from their full name: the name less their first name when it starts with it ("Mary
 * Ann Brown" with "Mary Ann" is "Brown"), or else the name's last word. The email composer's list (#3142) and a judge's
 * entries (#3200) both sort by it.
 */
export function lastNameOf(name: string | null | undefined, firstName?: string | null): string {
  const full = (name ?? '').trim();
  const first = (firstName ?? '').trim();

  if (first && full.toLowerCase().startsWith(`${first.toLowerCase()} `)) {
    return full.slice(first.length).trim();
  }

  return full.split(/\s+/).pop() ?? '';
}

/**
 * Text in the order a person expects a list to be in: case and accents ignored, and numbers compared as numbers, so
 * "Zoom 2" comes before "Zoom 10". A database's ORDER BY compares numbers as text. Every name sort uses it, on the site and in the API (#3331), so a list
 * is in one order on screen and in an email.
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
