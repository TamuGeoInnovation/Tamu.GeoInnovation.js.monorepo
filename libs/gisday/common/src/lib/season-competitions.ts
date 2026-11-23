import { DEADLINE_COMPETITIONS, DEADLINE_COMPETITION_TABLE, DeadlineCompetition } from './submission-deadlines';

/**
 * Which research competitions a season runs (#2948). An admin turns each on or off on the competitions' admin page, and
 * the submission form offers only those, the admin filters and deadlines follow, and the API refuses a new submission to
 * one that is off. The VGI competition is not among them: the site's `competitions` feature switches it (`sites.ts`).
 *
 * The season holds them as rows of `season_competitions`, one per competition it runs, loaded with it as `competitions`.
 * **None means every one**, so a season set before this, and a site that never sets it, runs them all as before. A
 * submission already made to a competition later turned off stays as it is, and admins still see it.
 */

/** Every research competition, in the admin page's order: those `DEADLINE_COMPETITION_TABLE` names. */
export const SEASON_COMPETITIONS: ReadonlyArray<DeadlineCompetition> = DEADLINE_COMPETITIONS;

/** What a season holds: a row for each competition it runs, or none for every one. */
export interface SeasonCompetitions {
  competitions?: ReadonlyArray<{ competitionType: string }> | null;
}

/** The competitions a season runs, in the admin page's order. */
export function seasonCompetitions(season: SeasonCompetitions | null | undefined): ReadonlyArray<DeadlineCompetition> {
  const named = (season?.competitions ?? []).map((row) => row.competitionType);

  if (named.length === 0) {
    return SEASON_COMPETITIONS;
  }

  return SEASON_COMPETITIONS.filter((competition) => named.includes(competition));
}

/** Whether a season runs a competition. */
export function runsCompetition(season: SeasonCompetitions | null | undefined, submissionType: unknown): boolean {
  return seasonCompetitions(season).includes(submissionType as DeadlineCompetition);
}

/**
 * The rows to store for a choice of competitions: none when it is every one, so the season keeps running whatever is
 * added later as a season set before this does; otherwise the competitions, in the admin page's order.
 */
export function competitionTypesValue(competitions: ReadonlyArray<string>): Array<DeadlineCompetition> {
  const chosen = SEASON_COMPETITIONS.filter((competition) => competitions.includes(competition));

  return chosen.length === SEASON_COMPETITIONS.length ? [] : chosen;
}

/**
 * Why a choice of competitions may not be saved, or null when it may: it must be a list of competitions this knows, and
 * name at least one. A season that runs no research competition at all is not one this was asked for, and turning every
 * one off by mistake would close the form to everyone.
 */
export function competitionTypesProblem(competitions: unknown): string | null {
  if (!Array.isArray(competitions)) {
    return 'The competitions must be a list.';
  }

  const unknown = competitions.filter((type) => !SEASON_COMPETITIONS.includes(type as DeadlineCompetition));

  if (unknown.length > 0) {
    return `${unknown.join(', ')} is not a competition.`;
  }

  return competitions.length === 0 ? 'A season must run at least one competition.' : null;
}

/** The competition's name for a student: "The poster competition is not running this season." */
export function notRunningMessage(competition: string): string {
  const label =
    DEADLINE_COMPETITION_TABLE.find((row) => row.competition === competition)?.label ?? `${competition} competition`;

  return `The ${label.charAt(0).toLowerCase()}${label.slice(1)} is not running this season.`;
}
