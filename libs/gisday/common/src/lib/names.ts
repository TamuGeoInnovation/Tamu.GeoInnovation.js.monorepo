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
