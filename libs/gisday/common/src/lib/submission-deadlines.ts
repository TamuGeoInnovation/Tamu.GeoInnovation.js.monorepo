/**
 * When each research competition stops taking submissions: poster and presentation (#2934), paper and cartography
 * (#2962). An admin sets them on the season, one pair per competition: when new submissions and edits close, and a
 * later one for when the files attached to them (#2933) close. An empty moment means that side stays open. One set of
 * rules, read by the API, which enforces them, and by the site, which shows them.
 *
 * The rules are one table, the competitions by the two kinds of deadline. A competition added to
 * `DEADLINE_COMPETITION_TABLE` gets its two fields, its checks and its place in the admin page's Competition settings
 * panel (#3037) from here; it needs only its two columns on the season (a test checks they are there) and a migration.
 *
 * A competition closes at its moment: a request made at that moment or later is refused. Reviewers, who hold
 * `update:competitions`, are not held to them; they review after submissions have closed.
 */

/**
 * The competitions that close at a deadline, as `Submission.submissionType` names them, in the order the admin page
 * lists them, with its name for each. Every competition type is here (#2962).
 */
export const DEADLINE_COMPETITION_TABLE = Object.freeze([
  { competition: 'poster', label: 'Poster competition' },
  { competition: 'presentation', label: 'Presentation competition' },
  { competition: 'paper', label: 'Paper competition' },
  { competition: 'cartography', label: 'Cartography competition' }
] as const);

export type DeadlineCompetition = (typeof DEADLINE_COMPETITION_TABLE)[number]['competition'];

export const DEADLINE_COMPETITIONS: ReadonlyArray<DeadlineCompetition> = Object.freeze(
  DEADLINE_COMPETITION_TABLE.map((row) => row.competition)
);

/** What a deadline closes: the submission itself (new ones and edits), or the files attached to it. */
export const DEADLINE_KINDS = Object.freeze(['submissions', 'files'] as const);

export type DeadlineKind = (typeof DEADLINE_KINDS)[number];

/** A season's field for one competition's deadline of one kind: `posterSubmissionsCloseAt`, `paperFilesCloseAt`. */
export type SubmissionDeadlineField = `${DeadlineCompetition}${Capitalize<DeadlineKind>}CloseAt`;

/** The moments, as the season holds them: a date, the text the API sends, or empty for open. */
export type SubmissionDeadlines = { [field in SubmissionDeadlineField]?: Date | string | null };

/** The season's field for a competition's deadline of one kind. */
export function deadlineField(competition: DeadlineCompetition, kind: DeadlineKind): SubmissionDeadlineField {
  return `${competition}${kind === 'submissions' ? 'Submissions' : 'Files'}CloseAt` as SubmissionDeadlineField;
}

/** Every deadline field, competition by competition, each competition's submissions before its files. */
export const SUBMISSION_DEADLINE_FIELDS: ReadonlyArray<SubmissionDeadlineField> = Object.freeze(
  DEADLINE_COMPETITIONS.flatMap((competition) => DEADLINE_KINDS.map((kind) => deadlineField(competition, kind)))
);

/** Whether a submission type is one of the competitions that close at a deadline. */
export function isDeadlineCompetition(submissionType: unknown): submissionType is DeadlineCompetition {
  return DEADLINE_COMPETITIONS.includes(submissionType as DeadlineCompetition);
}

/**
 * When a submission type's submissions, or its files, close, or `null` when they do not: the type has no deadline, or
 * none is set.
 */
export function closesAt(
  season: SubmissionDeadlines | null | undefined,
  submissionType: unknown,
  kind: DeadlineKind
): Date | null {
  if (!season || !isDeadlineCompetition(submissionType)) {
    return null;
  }

  return asDate(season[deadlineField(submissionType, kind)]);
}

/** The moment it closed if it has, at `now`; `null` while it is open. */
export function closedAt(
  season: SubmissionDeadlines | null | undefined,
  submissionType: unknown,
  kind: DeadlineKind,
  now: Date = new Date()
): Date | null {
  const moment = closesAt(season, submissionType, kind);

  return moment && now.getTime() >= moment.getTime() ? moment : null;
}

/** Why a request was refused, in words for the student: "Submissions to the poster competition closed on ...". */
export function closedMessage(competition: DeadlineCompetition, kind: DeadlineKind, at: Date): string {
  const what = kind === 'submissions' ? 'Submissions to' : 'File uploads for';

  return `${what} the ${competition} competition closed on ${inCentralTime(at)}.`;
}

/**
 * Why a set of deadlines may not be saved, or null when it may. Every moment must be a date or empty, and a
 * competition's files may not close before its submissions do, which includes while they stay open: the files are the
 * later deadline.
 */
export function deadlinesProblem(deadlines: SubmissionDeadlines): string | null {
  for (const field of SUBMISSION_DEADLINE_FIELDS) {
    const value = deadlines[field];

    if (value !== undefined && value !== null && value !== '' && !asDate(value)) {
      return `${field} is not a date.`;
    }
  }

  for (const competition of DEADLINE_COMPETITIONS) {
    const submissions = asDate(deadlines[deadlineField(competition, 'submissions')]);
    const files = asDate(deadlines[deadlineField(competition, 'files')]);

    if (files && (!submissions || files.getTime() < submissions.getTime())) {
      return `File uploads for the ${competition} competition cannot close before its submissions do.`;
    }
  }

  return null;
}

/** A moment as a date, from a date or the text the API sends, or `null` for none or an unreadable one. */
export function asDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value as string);

  return isNaN(date.getTime()) ? null : date;
}

/**
 * A moment as GIS Day's own clock reads it, so everyone sees the Central time whatever their computer is set to
 * (#2474): "Fri, Nov 14, 2026, 5:00 PM Central". `empty` when there is none. `brief` leaves out the year and the zone,
 * for a line of several moments that names the zone once: "Fri, Nov 14, 5:00 PM" (#2969).
 */
export function inCentralTime(
  value: Date | string | null | undefined,
  empty = 'No limit',
  { brief = false }: { brief?: boolean } = {}
): string {
  const date = asDate(value);

  if (!date) {
    return empty;
  }

  const text = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: brief ? undefined : 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);

  // Newer ICU puts a narrow no-break space before AM and PM.
  const time = text.replace(/\u202f/g, ' ');

  return brief ? time : `${time} Central`;
}
