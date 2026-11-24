import { DEADLINE_COMPETITIONS, DEADLINE_COMPETITION_TABLE, DeadlineCompetition, asDate } from './submission-deadlines';

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

/**
 * One of a season's rows of `season_competitions`: that it runs the competition, and the competition's settings for the
 * season (#3019): its sessions, and when its finalists hear.
 */
export interface CompetitionSettingsRow {
  competitionType: string;
  /**
   * Whether the row says the season runs the competition: true, or missing on a row from before #3019, as #2948's rows
   * always meant. Empty (null) on a row that holds only the competition's settings, so a season that runs every
   * competition can hold settings for one.
   */
  runs?: boolean | null;
  /** The competition's session, chosen in Admin: the poster session, or the undergraduate presentation session. */
  sessionGuid?: string | null;
  /** The graduate presentation session. */
  graduateSessionGuid?: string | null;
  /** The session its winners are announced at. */
  awardsSessionGuid?: string | null;
  /** When its finalists hear (7A): shown on the competition's page when set. */
  finalistsNotifiedAt?: Date | string | null;
}

/** What a season holds: a row for each competition it runs, or none for every one, and rows of settings (#3019). */
export interface SeasonCompetitions {
  competitions?: ReadonlyArray<CompetitionSettingsRow> | null;
}

/** A competition's row in a season, with its settings, or null when it has none (#3019). */
export function competitionSettings(
  season: SeasonCompetitions | null | undefined,
  competition: string
): CompetitionSettingsRow | null {
  return (season?.competitions ?? []).find((row) => row.competitionType === competition) ?? null;
}

/** When a competition's finalists hear (#3019, 7A), or null when the season has not set it. */
export function finalistsNotifiedAt(season: SeasonCompetitions | null | undefined, competition: string): Date | null {
  return asDate(competitionSettings(season, competition)?.finalistsNotifiedAt);
}

/** The competitions a season runs, in the admin page's order. A row of settings only (`runs` empty) runs nothing. */
export function seasonCompetitions(season: SeasonCompetitions | null | undefined): ReadonlyArray<DeadlineCompetition> {
  const named = (season?.competitions ?? []).filter((row) => row.runs !== null).map((row) => row.competitionType);

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

/** What the admin page sends for one competition's settings (#3019): its sessions, and when its finalists hear. */
export interface CompetitionSettingsInput {
  competitionType: string;
  sessionGuid?: string | null;
  graduateSessionGuid?: string | null;
  awardsSessionGuid?: string | null;
  finalistsNotifiedAt?: Date | string | null;
}

/** The sessions a competition's settings name, without the empty ones. */
export function chosenSessionGuids(settings: ReadonlyArray<CompetitionSettingsInput>): Array<string> {
  return settings
    .flatMap((row) => [row.sessionGuid, row.graduateSessionGuid, row.awardsSessionGuid])
    .filter((guid): guid is string => typeof guid === 'string' && guid.length > 0);
}

/**
 * Why a save of competitions' settings may not go ahead, or null when it may: a list, of competitions this knows, each
 * finalists date a date. Whether each session is one of the season's is the API's to check.
 */
export function competitionSettingsProblem(settings: unknown): string | null {
  if (!Array.isArray(settings)) {
    return 'The settings must be a list.';
  }

  for (const row of settings as Array<CompetitionSettingsInput>) {
    if (!SEASON_COMPETITIONS.includes(row?.competitionType as DeadlineCompetition)) {
      return `${row?.competitionType} is not a competition.`;
    }

    const date = row.finalistsNotifiedAt;

    if (date !== null && date !== undefined && date !== '' && !asDate(date)) {
      return `The ${row.competitionType} finalists date is not a date.`;
    }
  }

  return null;
}

/** The competition's name for a student: "The poster competition is not running this season." */
export function notRunningMessage(competition: string): string {
  const label =
    DEADLINE_COMPETITION_TABLE.find((row) => row.competition === competition)?.label ?? `${competition} competition`;

  return `The ${label.charAt(0).toLowerCase()}${label.slice(1)} is not running this season.`;
}
