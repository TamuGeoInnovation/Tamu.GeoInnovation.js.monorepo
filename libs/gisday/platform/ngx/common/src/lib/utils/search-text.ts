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

/**
 * The text a session is found by: its name, building and room, as the admin Events list searches them (#2914), and on
 * the public Sessions list (#2944) its presenters' names, which the API sends there.
 */
export function sessionSearchFields(session: {
  name?: string | null;
  location?: { building?: string | null; room?: string | null } | null;
  presenters?: Array<string> | null;
}): Array<string | null | undefined> {
  return [session.name, session.location?.building, session.location?.room, ...(session.presenters ?? [])];
}
