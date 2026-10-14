import { Speaker } from '@tamu-gisc/gisday/platform/data-api';

/**
 * A graduation year written as a class year: `'2014'` is `'14`, `'22'` is `'22`, and a record holding
 * more than one year, such as `'2019, 2021'`, is `'19, '21`. Anything else is an empty string.
 */
export function shortClassYear(graduationYear: string | null | undefined): string {
  const years = (graduationYear ?? '')
    .split(/[,;/&]|\band\b/)
    .map((year) => year.trim())
    .filter((year) => /^(\d{2}|\d{4})$/.test(year));

  return years.map((year) => `'${year.slice(-2)}`).join(', ');
}

/**
 * True for a Texas A&M former student: a speaker whose university is Texas A&M and who has a class year.
 * Their class year is written after their name, the way Aggies write it (#1768).
 */
export function isAggieFormerStudent(speaker: Partial<Speaker> | null | undefined): boolean {
  return speaker?.university?.acronym?.trim().toUpperCase() === 'TAMU' && shortClassYear(speaker.graduationYear) !== '';
}

/**
 * The company or organization a speaker is with: their organization, or the free-text affiliation for
 * a speaker with no organization recorded.
 */
export function speakerAffiliation(speaker: Partial<Speaker> | null | undefined): string {
  return speaker?.organization?.name?.trim() || speaker?.affiliation?.trim() || '';
}

/**
 * Orders speakers by their affiliation, then by last and first name, so people from the same company
 * sit together (#1769). Speakers with no affiliation come last. Returns a new array.
 */
export function sortSpeakersByAffiliation<T extends Partial<Speaker>>(speakers: Array<T> | null | undefined): Array<T> {
  const compare = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base' });

  return [...(speakers ?? [])].sort((a, b) => {
    const affiliationA = speakerAffiliation(a);
    const affiliationB = speakerAffiliation(b);

    if (affiliationA === '' || affiliationB === '') {
      if (affiliationA !== affiliationB) {
        return affiliationA === '' ? 1 : -1;
      }
    }

    return (
      compare(affiliationA, affiliationB) ||
      compare(a.lastName?.trim() ?? '', b.lastName?.trim() ?? '') ||
      compare(a.firstName?.trim() ?? '', b.firstName?.trim() ?? '')
    );
  });
}
