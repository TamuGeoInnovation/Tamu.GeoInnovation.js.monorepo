/** Lower case, accents dropped, so "jose" finds "José". */
export function foldedText(text: string | null | undefined): string {
  return (text ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

/**
 * Whether any of `fields` contains the search text, ignoring case and accents; an empty search matches everything.
 * The Presenters page's search (#2859, #2869), shared with the admin's Speaker badges table (#2899).
 */
export function matchesText(fields: Array<string | null | undefined>, search: string): boolean {
  const wanted = foldedText(search).trim();

  return !wanted || fields.some((field) => foldedText(field).includes(wanted));
}
