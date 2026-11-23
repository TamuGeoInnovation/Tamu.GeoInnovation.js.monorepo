import { Speaker, University } from '@tamu-gisc/gisday/platform/data-api';

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
 * The speaker as the class banner on their photograph sees it, from a form that is being filled in: the university
 * chosen (by guid, looked up in the season's list for its acronym and colour) and the graduation year typed. The admin
 * speaker form and a speaker's own edit page both draw their banner from this, so it shows what the public pages will
 * once the form is saved (#2956).
 */
export function classBannerSpeaker(
  universityGuid: string | null | undefined,
  graduationYear: string | null | undefined,
  universities: Array<Partial<University>> | null | undefined
): Partial<Speaker> {
  const university = universityGuid ? (universities ?? []).find((u) => u.guid === universityGuid) : undefined;

  return { university: university ?? null, graduationYear: graduationYear ?? '' } as Partial<Speaker>;
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

const compare = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base' });

/** Last name, then first name, ignoring case and accents: the order a list of people is read in. */
function compareByName(a: Partial<Speaker>, b: Partial<Speaker>): number {
  return (
    compare(a.lastName?.trim() ?? '', b.lastName?.trim() ?? '') ||
    compare(a.firstName?.trim() ?? '', b.firstName?.trim() ?? '')
  );
}

/**
 * Orders speakers by last name, then first name: the speakers on an event's edit page (#2940) and its public page
 * (#3196). Missing entries (a
 * speaker no longer in the season's list) are left out. Returns a new array.
 */
export function sortSpeakersByName<T extends Partial<Speaker>>(
  speakers: Array<T | null | undefined> | null | undefined
): Array<T> {
  return (speakers ?? []).filter((s): s is T => Boolean(s)).sort(compareByName);
}
