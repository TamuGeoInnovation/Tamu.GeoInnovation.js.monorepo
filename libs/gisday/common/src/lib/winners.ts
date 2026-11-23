import { dayHasPassed } from './gisday-common';
import { JUDGED_COMPETITIONS, isJudgedCompetition } from './judging';

/**
 * A season's winners (#3239): 1st, 2nd and 3rd of each research competition, picked by the admins from that season's
 * accepted submissions, and shown on the homepage of gisday.tamu.edu from the day after the season's last GIS Day day
 * until the next season is active. A winner is a submission, so the name and title shown are read from it when shown and
 * nothing is copied or typed. The trail challenge (VGI) has a place on the page and a place in the table, as an account
 * rather than a submission, but no picker yet.
 *
 * One set of rules, read by the API, which enforces them, and by the site, which shows them.
 */

/** The places a competition has, in the order shown. */
export const WINNER_PLACES = Object.freeze([1, 2, 3] as const);

export type WinnerPlace = (typeof WINNER_PLACES)[number];

/** The trail challenge's key, beside the judged competitions'. */
export const TRAIL_COMPETITION = 'trail';

/** Every competition the homepage can show winners of, in the order it shows them: the judged ones, then the trail. */
export const WINNER_COMPETITIONS: ReadonlyArray<{ competition: string; label: string }> = Object.freeze([
  ...JUDGED_COMPETITIONS.map(({ competition, label }) => ({ competition, label })),
  { competition: TRAIL_COMPETITION, label: 'Trail challenge' }
]);

/** "1st", "2nd" or "3rd". */
export function placeLabel(place: number): string {
  return ({ 1: '1st', 2: '2nd', 3: '3rd' } as Record<number, string>)[place] ?? `${place}th`;
}

/** One winner as the homepage shows it: its place, its people's names and its title. Nothing else leaves the API. */
export interface WinnerDto {
  place: number;
  names: Array<string>;
  title: string | null;
}

/** A season's winners as the homepage reads them: each competition with any, in order, its places in order. */
export interface SeasonWinnersDto {
  year: number;
  competitions: Array<{ competition: string; label: string; winners: Array<WinnerDto> }>;
}

/** One place as the admins pick it: the submission in it, or null for none. */
export interface WinnerChoice {
  competition: string;
  place: number;
  submission: string | null;
}

/** An entry an admin can pick: an accepted submission of the competition, with its people's names. */
export interface WinnerEntryDto {
  guid: string;
  title: string | null;
  names: Array<string>;
}

/** What the admins' Winners page reads for a season: every judged competition's entries, and the places picked. */
export interface SeasonWinnersAdminDto {
  competitions: Array<{ competition: string; label: string; entries: Array<WinnerEntryDto> }>;
  winners: Array<WinnerChoice>;
}

/**
 * Whether a season's winners are shown at `now`: once every one of its days has passed in Central time, so from the day
 * after its last. A season with no days is never over. Until then the homepage is still about the event to come. The
 * next season, once active, replaces it on the homepage, and has no winners until its own GIS Day is over.
 */
export function winnersShown(days: Array<{ date: Date | string }> | null | undefined, now: Date = new Date()): boolean {
  return !!days?.length && days.every((day) => dayHasPassed(day.date, now));
}

/**
 * Why the places an admin sent cannot be saved, or null when they can: each must be a judged competition's 1st, 2nd or
 * 3rd, at most once, and a submission at most one place in its competition. Whether each submission is that
 * competition's, in that season, accepted, is checked by the API against the database.
 */
export function winnerChoicesProblem(choices: unknown): string | null {
  if (!Array.isArray(choices)) {
    return 'Send the places as a list.';
  }

  const places = new Set<string>();
  const submissions = new Set<string>();

  for (const choice of choices as Array<Partial<WinnerChoice>>) {
    if (!choice || !isJudgedCompetition(choice.competition)) {
      return 'Each place must be in a research competition.';
    }

    if (!WINNER_PLACES.includes(choice.place as WinnerPlace)) {
      return 'Each place must be 1st, 2nd or 3rd.';
    }

    if (choice.submission !== null && typeof choice.submission !== 'string') {
      return 'Each place must name a submission, or none.';
    }

    const place = `${choice.competition}:${choice.place}`;

    if (places.has(place)) {
      return `${placeLabel(choice.place)} place was sent twice for one competition.`;
    }

    places.add(place);

    if (choice.submission) {
      const entry = `${choice.competition}:${choice.submission}`;

      if (submissions.has(entry)) {
        return 'A submission can win only one place in its competition.';
      }

      submissions.add(entry);
    }
  }

  return null;
}
