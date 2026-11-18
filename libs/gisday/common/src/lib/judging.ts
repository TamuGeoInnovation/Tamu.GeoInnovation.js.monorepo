import { lastNameOf } from './names';
import { personalLinkEmailProblem, profileEmailValues } from './profile-email';
import { RubricCriterionValue, RubricValue } from './rubrics';
import { SessionDetailsSession, sessionWhen, sessionWhere } from './session-details-email';

/**
 * Judging the research competitions (#3183). A session is marked with the competition its judges score, and some of its
 * speakers as its judges. Each judge is emailed their own judging link, with no account, which lists every accepted
 * submission of that competition with the season's rubric for it; they score each criterion until the admins close
 * judging for the session. Admins see every judge's scores; a judge sees only their own; students see none.
 *
 * One set of rules, read by the API, which enforces them, and by the site, which shows them.
 */

/**
 * The competitions a session can judge, as `Event.judgedCompetition` holds them, each a classification and a type of
 * submission (`Submission.classificationType`, `Submission.submissionType`), in the order the session form lists them.
 */
export const JUDGED_COMPETITIONS = Object.freeze([
  { competition: 'graduate-poster', label: 'Graduate poster competition', classification: 'graduate', type: 'poster' },
  {
    competition: 'undergraduate-poster',
    label: 'Undergraduate poster competition',
    classification: 'undergraduate',
    type: 'poster'
  },
  {
    competition: 'graduate-presentation',
    label: 'Graduate presentation competition',
    classification: 'graduate',
    type: 'presentation'
  },
  {
    competition: 'undergraduate-presentation',
    label: 'Undergraduate presentation competition',
    classification: 'undergraduate',
    type: 'presentation'
  }
] as const);

export type JudgedCompetition = (typeof JUDGED_COMPETITIONS)[number]['competition'];

export type JudgedCompetitionRow = (typeof JUDGED_COMPETITIONS)[number];

/** Whether a value is a competition a session can judge. */
export function isJudgedCompetition(value: unknown): value is JudgedCompetition {
  return JUDGED_COMPETITIONS.some((row) => row.competition === value);
}

/** A judged competition's classification, type and label, or null when it is not one. */
export function judgedCompetition(value: unknown): JudgedCompetitionRow | null {
  return JUDGED_COMPETITIONS.find((row) => row.competition === value) ?? null;
}

/** The judged competition a submission is in, from its classification and type, or null when none judges it. */
export function judgedCompetitionOf(submission: {
  classificationType?: string | null;
  submissionType?: string | null;
}): JudgedCompetition | null {
  return (
    JUDGED_COMPETITIONS.find(
      (row) => row.classification === submission.classificationType && row.type === submission.submissionType
    )?.competition ?? null
  );
}

/**
 * Why a session's judged competition may not be saved, or null when it may: none, or one of `JUDGED_COMPETITIONS`.
 */
export function judgedCompetitionProblem(value: unknown): string | null {
  if (value === null || value === undefined || value === '' || isJudgedCompetition(value)) {
    return null;
  }

  return `${String(value)} is not a competition a session can judge.`;
}

/** The longest a judge's comment may be. */
export const ASSESSMENT_COMMENT_LIMIT = 4000;

/** What a judge is told when they try to change their scores after the admins have closed judging. */
export const JUDGING_CLOSED_MESSAGE = 'Judging is closed for this competition. Your scores can no longer be changed.';

/** What a judge is told when they score a submission that is not in a competition they judge. */
export const NOT_YOUR_COMPETITION_MESSAGE = 'That submission is not in a competition you judge.';

/**
 * Why a judge's scores may not be saved against a rubric's criteria, or null when they may: a score for every criterion
 * and no other, each a whole number from 0 to the criterion's points, and a comment of a sensible size if any.
 */
export function assessmentProblem(
  criteria: ReadonlyArray<Pick<RubricCriterionValue, 'name' | 'maxPoints'> & { guid?: string }>,
  scores: unknown,
  comment?: unknown
): string | null {
  if (scores === null || typeof scores !== 'object' || Array.isArray(scores)) {
    return 'Give a score for each criterion.';
  }

  const given = scores as Record<string, unknown>;
  const known = new Set(criteria.map((c) => c.guid));
  const unknown = Object.keys(given).filter((key) => !known.has(key));

  if (unknown.length > 0) {
    return 'A score was given for a criterion that is not on the rubric. Reload the page and score again.';
  }

  for (const c of criteria) {
    const score = given[c.guid ?? ''];

    if (score === undefined || score === null || score === '') {
      return `Give a score for ${c.name}.`;
    }

    if (typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > c.maxPoints) {
      return `${c.name} is scored as a whole number from 0 to ${c.maxPoints}.`;
    }
  }

  if (comment !== undefined && comment !== null) {
    if (typeof comment !== 'string' || comment.length > ASSESSMENT_COMMENT_LIMIT) {
      return `The comment must be text, up to ${ASSESSMENT_COMMENT_LIMIT} characters.`;
    }
  }

  return null;
}

/** The total of a judge's scores on a rubric's criteria. */
export function assessmentTotal(
  criteria: ReadonlyArray<{ guid?: string }>,
  scores: Readonly<Record<string, number>>
): number {
  return criteria.reduce((sum, c) => sum + (Number(scores?.[c.guid ?? '']) || 0), 0);
}

/** A rubric as the API gives it: saved, so it and each of its criteria have an id, in their order. */
export interface RubricDto extends RubricValue {
  guid: string;
  criteria: Array<RubricCriterionValue & { guid: string; position: number }>;
}

/** A judge's own scores for one submission, as their page shows them. */
export interface JudgeAssessmentDto {
  scores: Record<string, number>;
  total: number;
  comment: string | null;
  updated: string;
}

/** A submission as a judge sees it: what it is and who presents it, never their addresses, and the judge's own scores. */
export interface JudgeSubmissionDto {
  guid: string;
  title: string;
  presenters: Array<string>;
  abstract: string | null;
  format: string | null;
  assessment: JudgeAssessmentDto | null;
}

/** One competition a judge scores: its sessions, whether judging is closed, the rubric, and the submissions. */
export interface JudgeCompetitionDto {
  competition: JudgedCompetition;
  label: string;
  sessions: Array<{ guid: string; name: string }>;
  closed: boolean;
  rubric: RubricDto | null;
  submissions: Array<JudgeSubmissionDto>;
}

/** What a judging link opens. */
export interface JudgePageDto {
  firstName: string;
  lastName: string;
  expires: string;
  competitions: Array<JudgeCompetitionDto>;
}

/** How many of a competition's submissions a judge has scored: "3 of 8 scored". */
export function scoredLine(competition: Pick<JudgeCompetitionDto, 'submissions'>): string {
  const scored = competition.submissions.filter((s) => s.assessment).length;

  return `${scored} of ${competition.submissions.length} scored`;
}

/** One submission's line of a competition's results. */
export interface JudgingResultRow {
  guid: string;
  title: string;
  presenters: Array<string>;
  /** Each judge's total, by the judge's id, or null when they have not scored it. */
  totals: Record<string, number | null>;
  /** How many judges scored it. */
  judged: number;
  /** The mean of the judges' totals, to two places, or null when none has scored it. */
  average: number | null;
  /** Each criterion's mean score, by the criterion's id, to two places, or null when none has scored it. */
  criteria: Record<string, number | null>;
  /**
   * Each judge's own scores for it, by the judge's id (#3193): a score per criterion, by the criterion's id, their total
   * and their comment, or null when they have not scored it. For the admins' breakdown of one entry; never on a judge's
   * page.
   */
  assessments: Record<string, JudgeScores | null>;
}

/** One judge's scores for one entry, as the admins' breakdown shows them (#3193). */
export interface JudgeScores {
  scores: Record<string, number>;
  total: number;
  comment: string | null;
}

/** A competition's results: the rubric's criteria, each judge's progress, and a row per accepted submission. */
export interface JudgingResultsDto {
  competition: JudgedCompetition;
  label: string;
  rubric: { name: string; criteria: Array<{ guid: string; name: string; maxPoints: number }> } | null;
  judges: Array<{ guid: string; name: string; scored: number; toScore: number }>;
  rows: Array<JudgingResultRow>;
}

/** What the results are worked out from: the competition's rubric, submissions, judges and every judge's scores. */
export interface JudgingResultsInput {
  competition: JudgedCompetition;
  criteria: ReadonlyArray<{ guid: string; name: string; maxPoints: number }>;
  rubricName: string | null;
  submissions: ReadonlyArray<{ guid: string; title: string; presenters: Array<string> }>;
  judges: ReadonlyArray<{ guid: string; name: string }>;
  assessments: ReadonlyArray<{
    judge: string;
    submission: string;
    scores: Record<string, number>;
    total: number;
    comment?: string | null;
  }>;
}

const twoPlaces = (n: number) => Math.round(n * 100) / 100;
const mean = (values: Array<number>) =>
  values.length ? twoPlaces(values.reduce((a, b) => a + b, 0) / values.length) : null;

/**
 * A competition's results (decided 6A, 16 November 2026): for each accepted submission, each judge's total, how many
 * judged it, the mean of their totals, and each criterion's mean; and each judge's progress. Highest average first, those
 * not yet judged last, by title. A judge who scored and has since been taken off the session still counts.
 */
export function judgingResults(input: JudgingResultsInput): JudgingResultsDto {
  const submissionIds = new Set(input.submissions.map((s) => s.guid));
  const assessments = input.assessments.filter((a) => submissionIds.has(a.submission));
  const judges = [...input.judges];

  for (const a of assessments) {
    if (!judges.some((j) => j.guid === a.judge)) {
      judges.push({ guid: a.judge, name: 'A former judge' });
    }
  }

  const rows: Array<JudgingResultRow> = input.submissions.map((s) => {
    const mine = assessments.filter((a) => a.submission === s.guid);

    return {
      guid: s.guid,
      title: s.title,
      presenters: s.presenters,
      totals: Object.fromEntries(judges.map((j) => [j.guid, mine.find((a) => a.judge === j.guid)?.total ?? null])),
      judged: mine.length,
      average: mean(mine.map((a) => a.total)),
      criteria: Object.fromEntries(
        input.criteria.map((c) => [
          c.guid,
          mean(mine.map((a) => a.scores?.[c.guid]).filter((v): v is number => typeof v === 'number'))
        ])
      ),
      assessments: Object.fromEntries(
        judges.map((j) => {
          const a = mine.find((m) => m.judge === j.guid);

          return [j.guid, a ? { scores: a.scores ?? {}, total: a.total, comment: a.comment ?? null } : null];
        })
      )
    };
  });

  rows.sort(
    (a, b) =>
      (b.average ?? -1) - (a.average ?? -1) || (a.title ?? '').localeCompare(b.title ?? '', 'en', { sensitivity: 'base' })
  );

  return {
    competition: input.competition,
    label: judgedCompetition(input.competition)?.label ?? input.competition,
    rubric: input.rubricName === null ? null : { name: input.rubricName, criteria: [...input.criteria] },
    judges: judges.map((j) => {
      const scored = assessments.filter((a) => a.judge === j.guid).length;

      return { ...j, scored, toScore: Math.max(0, input.submissions.length - scored) };
    }),
    rows
  };
}

/** The results as a table for a CSV file: a heading row, then a row per submission, as the results page shows them. */
export function judgingResultsTable(results: JudgingResultsDto): {
  fields: Array<string>;
  data: Array<Array<string | number>>;
} {
  const criteria = results.rubric?.criteria ?? [];
  const blank = (n: number | null) => (n === null ? '' : n);

  return {
    fields: [
      'Rank',
      'Title',
      'Presenters',
      'Judges',
      'Average total',
      ...results.judges.map((j) => j.name),
      ...criteria.map((c) => `${c.name} (average of ${c.maxPoints})`)
    ],
    data: results.rows.map((row, i) => [
      row.average === null ? '' : i + 1,
      row.title,
      row.presenters.join('; '),
      row.judged,
      blank(row.average),
      ...results.judges.map((j) => blank(row.totals[j.guid] ?? null)),
      ...criteria.map((c) => blank(row.criteria[c.guid] ?? null))
    ])
  };
}

/** One judge's line of an entry's breakdown (#3193): their score on each criterion, in the rubric's order, and the rest. */
export interface JudgeBreakdownLine {
  guid: string;
  name: string;
  scored: boolean;
  /** Each criterion's score, in the rubric's order, or null when not scored. */
  scores: Array<number | null>;
  total: number | null;
  comment: string | null;
}

/** What a judge who has not scored an entry is shown as, in the breakdown and the Every score file. */
export const NOT_SCORED_YET = 'Not scored yet';

/**
 * One entry's breakdown (#3193, decided 17 November 2026): a line per judge of the competition, with their score on each
 * criterion in the rubric's order, their total and their comment, or not scored yet.
 */
export function judgeBreakdown(
  results: Pick<JudgingResultsDto, 'judges' | 'rubric'>,
  row: Pick<JudgingResultRow, 'assessments'>
): Array<JudgeBreakdownLine> {
  const criteria = results.rubric?.criteria ?? [];

  return results.judges.map((judge) => {
    const a = row.assessments?.[judge.guid] ?? null;

    return {
      guid: judge.guid,
      name: judge.name,
      scored: a !== null,
      scores: criteria.map((c) => (a && typeof a.scores?.[c.guid] === 'number' ? a.scores[c.guid] : null)),
      total: a?.total ?? null,
      comment: a?.comment ?? null
    };
  });
}

/**
 * Every score as a table for a CSV file (#3193): a row per judge per entry, scored or not, in the results' order, with
 * the entry, the judge, each criterion's score in the rubric's order, the total and the comment. A judge who has not
 * scored the entry has no scores, and "Not scored yet" for a total.
 */
export function everyScoreTable(results: JudgingResultsDto): { fields: Array<string>; data: Array<Array<string | number>> } {
  const criteria = results.rubric?.criteria ?? [];
  const blank = (n: number | null) => (n === null ? '' : n);

  return {
    fields: ['Title', 'Presenters', 'Judge', ...criteria.map((c) => `${c.name} (of ${c.maxPoints})`), 'Total', 'Comment'],
    data: results.rows.flatMap((row) =>
      judgeBreakdown(results, row).map((line) => [
        row.title,
        row.presenters.join('; '),
        line.name,
        ...line.scores.map(blank),
        line.total ?? NOT_SCORED_YET,
        line.comment ?? ''
      ])
    )
  };
}

/** The Ask to judge email's kind in the composer, and so the key its text comes back under. */
export const JUDGING_EMAIL_KIND = 'judging';

/** Where each judge's own link goes in the text. */
export const JUDGING_LINK_PLACEHOLDER = '{judging link}';

/** The placeholders it may use, filled in for each judge. */
export const JUDGING_EMAIL_PLACEHOLDERS = Object.freeze([
  '{first name}',
  '{site}',
  '{site address}',
  JUDGING_LINK_PLACEHOLDER,
  '{link expires}'
] as const);

/** What the preview shows for `{judging link}`: each judge's own link is made only when their email is sent. */
export const JUDGING_LINK_PREVIEW = '(their own judging link, added when it is sent)';

/** Why it is only ever sent as a copy each, as the composer says beside its tick boxes. */
export const JUDGING_COPY_EACH =
  'Each judge gets their own copy: it carries their own link to score the entries, which no one else should have.';

/** The subject it starts from: the competition and the site. */
export function judgingEmailSubject(competition: JudgedCompetition): string {
  return `Judging the ${(judgedCompetition(competition)?.label ?? 'competition').toLowerCase()} at {site}`;
}

/**
 * The text it starts from, for the session as it is saved: which competition, the session, its day and time in Central
 * and its room (left to the design's details box when the email is in Texas A&M's design), and the judge's own link.
 */
export function judgingEmailTemplate(
  session: SessionDetailsSession,
  competition: JudgedCompetition,
  designed = false
): string {
  const label = (judgedCompetition(competition)?.label ?? 'competition').toLowerCase();
  const name = (session.name ?? '').trim() || 'the session';

  return [
    'Howdy {first name},',
    `Thank you for judging the **${label}** at {site}, in **${name}**.`,
    designed ? '' : [`- **When:** ${sessionWhen(session)}`, `- **Where:** ${sessionWhere(session)}`].join('\n'),
    `**Score the entries here:** ${JUDGING_LINK_PLACEHOLDER}`,
    'This link is yours alone and works until {link expires}. It lists every entry in the competition with the rubric. Give each criterion a score and choose **Save**; you can change your scores until the {site} team closes judging. Only the {site} team sees your scores.',
    'Questions? Reply to this email.',
    '— The {site} Team'
  ]
    .filter(Boolean)
    .join('\n\n');
}

/** Each placeholder's value for one judge: `link` is their own, or `JUDGING_LINK_PREVIEW` in a preview. */
export function judgingEmailValues(
  speaker: { firstName?: string | null },
  site: { name: string; address: string },
  link: string,
  expires: Date
): Record<string, string> {
  const values = profileEmailValues(speaker, site, link, expires);

  delete values['{edit link}'];

  return { ...values, [JUDGING_LINK_PLACEHOLDER]: link };
}

/** Why an edited email may not be sent, or null when it may: the text must keep `{judging link}`. */
export function judgingEmailProblem(email: unknown): string | null {
  return personalLinkEmailProblem(email, JUDGING_LINK_PLACEHOLDER);
}

/**
 * Entries in order by their first author's last name, then that author's whole name, then title, ignoring case and
 * accents; an entry with no authors comes last. A judge's page lists them so (#3200). A new list: the one given is left
 * as it was.
 */
export function byFirstAuthor<T extends { title: string; presenters: ReadonlyArray<string> }>(
  entries: ReadonlyArray<T> | null | undefined
): Array<T> {
  const compare = (a: string, b: string) => a.localeCompare(b, 'en', { sensitivity: 'base' });
  const first = (e: T) => (e.presenters?.[0] ?? '').trim();

  return [...(entries ?? [])].sort((a, b) => {
    const fa = first(a);
    const fb = first(b);

    if (!fa || !fb) {
      if (fa !== fb) {
        return fa ? -1 : 1;
      }
    }

    return compare(lastNameOf(fa), lastNameOf(fb)) || compare(fa, fb) || compare(a.title ?? '', b.title ?? '');
  });
}
