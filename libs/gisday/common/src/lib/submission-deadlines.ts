/**
 * When the poster and presentation competitions stop taking submissions (#2934). An admin sets them on the season, one
 * pair per competition: when new submissions and edits close, and a later one for when the files attached to them
 * (#2933) close. An empty moment means that side stays open. One set of rules, read by the API, which enforces them,
 * and by the site, which shows them.
 *
 * A competition closes at its moment: a request made at that moment or later is refused. Reviewers, who hold
 * `update:competitions`, are not held to them; they review after submissions have closed.
 */

/** The competitions that close at a deadline, as `Submission.submissionType` names them. */
export const DEADLINE_COMPETITIONS = Object.freeze(['poster', 'presentation'] as const);

export type DeadlineCompetition = (typeof DEADLINE_COMPETITIONS)[number];

/** The four moments, as the season holds them: a date, the text the API sends, or empty for open. */
export interface SubmissionDeadlines {
  posterSubmissionsCloseAt?: Date | string | null;
  posterFilesCloseAt?: Date | string | null;
  presentationSubmissionsCloseAt?: Date | string | null;
  presentationFilesCloseAt?: Date | string | null;
}

export const SUBMISSION_DEADLINE_FIELDS = Object.freeze([
  'posterSubmissionsCloseAt',
  'posterFilesCloseAt',
  'presentationSubmissionsCloseAt',
  'presentationFilesCloseAt'
] as const);

export type SubmissionDeadlineField = (typeof SUBMISSION_DEADLINE_FIELDS)[number];

/** What a deadline closes: the submission itself (new ones and edits), or the files attached to it. */
export type DeadlineKind = 'submissions' | 'files';

/** Whether a submission type is one of the competitions that close at a deadline. */
export function isDeadlineCompetition(submissionType: unknown): submissionType is DeadlineCompetition {
  return DEADLINE_COMPETITIONS.includes(submissionType as DeadlineCompetition);
}

/** The season's field for a competition's deadline of one kind. */
export function deadlineField(competition: DeadlineCompetition, kind: DeadlineKind): SubmissionDeadlineField {
  return `${competition}${kind === 'submissions' ? 'Submissions' : 'Files'}CloseAt` as SubmissionDeadlineField;
}

/**
 * When a submission type's submissions, or its files, close, or `null` when they do not: the type has no deadline
 * (paper, cartography), or none is set.
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
 * (#2474): "Fri, Nov 14, 2026, 5:00 PM Central". `empty` when there is none.
 */
export function inCentralTime(value: Date | string | null | undefined, empty = 'No limit'): string {
  const date = asDate(value);

  if (!date) {
    return empty;
  }

  const text = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);

  // Newer ICU puts a narrow no-break space before AM and PM.
  return `${text.replace(/\u202f/g, ' ')} Central`;
}
