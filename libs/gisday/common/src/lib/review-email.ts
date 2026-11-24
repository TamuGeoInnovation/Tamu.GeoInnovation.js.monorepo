import { closesAt, inCentralTime, SubmissionDeadlines } from './submission-deadlines';
import { formatCentral } from './central-time';

/**
 * The email a student gets when their competition submission is reviewed (#2957, #2980), as a template the reviewer sees
 * and can edit before it is sent (#2981). The same template serves one submission or many: each placeholder is filled in
 * for each submission.
 */

/**
 * Which email is sent: on a decision, a poster finalist's, a presenter's, or a rejection; or the final reminder to upload
 * the final poster or presentation (#3017).
 */
export type ReviewEmailKind = 'poster' | 'presentation' | 'rejection' | 'poster-reminder' | 'presentation-reminder';

/** Every kind, in the order a preview lists them. */
export const REVIEW_EMAIL_KINDS: ReadonlyArray<ReviewEmailKind> = Object.freeze([
  'poster',
  'presentation',
  'rejection',
  'poster-reminder',
  'presentation-reminder'
]);

/** The placeholders a template may use, filled in for each submission. */
export const REVIEW_EMAIL_PLACEHOLDERS = Object.freeze([
  '{first name}',
  '{title}',
  '{upload deadline}',
  '{site}',
  '{site address}',
  '{your session}',
  '{awards session}',
  '{notes}'
] as const);

export type ReviewEmailValues = Record<string, string>;

/** The kind of email a decision on a submission sends. */
export function reviewEmailKind(acceptance: boolean, submissionType: unknown): ReviewEmailKind {
  if (!acceptance) {
    return 'rejection';
  }

  return submissionType === 'poster' ? 'poster' : 'presentation';
}

/** The final reminder's kind for a submission (#3017): a poster's, or a presentation's. */
export function reminderEmailKind(submissionType: unknown): ReviewEmailKind {
  return submissionType === 'poster' ? 'poster-reminder' : 'presentation-reminder';
}

/**
 * Whether a submission has its final presentation or poster uploaded (#3017). A submission's files have no kind (#2933)
 * and its abstract is text, so any file it has is its final one.
 */
export function hasFinalFile(submission: { files?: ReadonlyArray<unknown> | null }): boolean {
  return (submission.files?.length ?? 0) > 0;
}

/** Why a selected submission gets no final reminder (#3017). */
export type ReminderSkipReason = 'already has a file' | 'not accepted';

/**
 * Why a submission gets no final reminder, or null when it gets one (#3017): it was not accepted (rejected, or not yet
 * reviewed; decided 15 November), or it already has its final file.
 */
export function reminderSkipReason(submission: {
  reviewed?: boolean | null;
  acceptance?: boolean | null;
  files?: ReadonlyArray<unknown> | null;
}): ReminderSkipReason | null {
  if (!(submission.reviewed && submission.acceptance)) {
    return 'not accepted';
  }

  return hasFinalFile(submission) ? 'already has a file' : null;
}

/** How many were skipped, and why: "1 that already has a file and 2 that were not accepted". */
export function reminderSkipSummary(skipped: ReadonlyArray<{ reason: ReminderSkipReason }>): string {
  const count = (reason: ReminderSkipReason) => skipped.filter((s) => s.reason === reason).length;
  const files = count('already has a file');
  const unaccepted = count('not accepted');

  return [
    files ? `${files} that already ${files === 1 ? 'has' : 'have'} a file` : '',
    unaccepted ? `${unaccepted} that ${unaccepted === 1 ? 'was' : 'were'} not accepted` : ''
  ]
    .filter(Boolean)
    .join(' and ');
}

const KIND_LABELS: Record<ReviewEmailKind, string> = {
  poster: 'Accepted posters',
  presentation: 'Accepted presentations',
  rejection: 'Rejections',
  'poster-reminder': 'Final reminders: posters',
  'presentation-reminder': 'Final reminders: presentations'
};

/** What each kind is called where the reviewer chooses its text. */
export function reviewEmailKindLabel(kind: ReviewEmailKind): string {
  return KIND_LABELS[kind];
}

/** The email's subject, naming the site and the decision. */
export function reviewEmailSubject(acceptance: boolean, siteName: string): string {
  return acceptance ? `Your ${siteName} submission has been accepted` : `Your ${siteName} submission`;
}

/** A kind's subject, naming the site: a decision's, or the final reminder's (#3017). */
export function reviewEmailKindSubject(kind: ReviewEmailKind, siteName: string): string {
  if (kind === 'poster-reminder' || kind === 'presentation-reminder') {
    return `Final reminder: upload your final ${kind === 'poster-reminder' ? 'poster' : 'presentation'} for ${siteName}`;
  }

  return reviewEmailSubject(kind !== 'rejection', siteName);
}

/** The text each kind starts from, before the reviewer edits it. */
export function reviewEmailTemplate(kind: ReviewEmailKind): string {
  if (kind === 'presentation-reminder') {
    // The maintainer's draft (#3017), with the other emails' sign-off.
    return `Hi {first name},

This is your final reminder. We don't yet have the final presentation slides for "{title}".

Upload them on {site} at {site address}/account/submissions by {upload deadline}. If your final slides are not uploaded by then, your submission will be removed from the competition and you won't present.

Your session: {your session}

You have 5 minutes in all, questions included: about 4 minutes to present and 1 for questions. Plan on about 4 slides.

Winners are announced at {awards session}.

If you've uploaded them in the last few minutes, thank you, and you can ignore this message.

Best regards,
The {site} Team`;
  }

  if (kind === 'poster-reminder') {
    // The same draft for a poster, with the poster finalist's details (#2980).
    return `Hi {first name},

This is your final reminder. We don't yet have the final poster for "{title}".

Upload it on {site} at {site address}/account/submissions by {upload deadline}. If your final poster is not uploaded by then, your submission will be removed from the competition and won't be judged.

Your session: {your session}

Print your poster, 36 x 48 inches or smaller, and bring it with you. You, or at least one member of your team, must be at your poster during the competition to be eligible for an award.

Winners are announced at {awards session}.

If you've uploaded it in the last few minutes, thank you, and you can ignore this message.

Best regards,
The {site} Team`;
  }

  if (kind === 'rejection') {
    return `Howdy {first name},

Thank you for your recent submission, titled "{title}."

We regret to inform you that your submission has not been accepted for the {site} competition. We appreciate the time and effort you put into your work, and encourage you to consider future opportunities to engage with the GIS community.

{notes}

If you have any questions, reply to this email.

Best regards,
The {site} Team`;
  }

  if (kind === 'poster') {
    // A poster finalist's instructions differ: print and bring it, set up early, be there to win (#2980).
    return `Howdy {first name},

Congratulations! Your poster, "{title}", has been accepted as a finalist in the {site} poster competition.

What to do next:

1. Upload your final poster by {upload deadline}. Sign in at {site address}/account/submissions, open your submission, and attach it under Presentation files: PDF or PowerPoint, up to 100 MB.

2. Print your poster, 36 x 48 inches or smaller, and bring it with you.

3. Set up early. Please have your poster up as early in the day as you can: the judges walk the poster area all day, and the earlier it is up, the more of them see it. Your session: {your session}

4. Be there to win. You, or at least one member of your team, must be at your poster during the competition to be eligible for an award.

5. Complete your presenter profile. A separate email will bring you a personal link to add your bio, photo, university and class year to the program.

6. Winners are announced at {awards session}.

{notes}

Questions? Reply to this email.

Best regards,
The {site} Team`;
  }

  // A presentation finalist's instructions: the deadline, the session, the time limit and how to fit it (#2983). The
  // minutes are the reviewer's to set in the text before it is sent (#2981).
  return `Howdy {first name},

Congratulations! Your presentation, "{title}", has been accepted as a finalist in the {site} research presentation competition.

What to do next:

1. Submit your final presentation by {upload deadline}. Sign in at {site address}/account/submissions, open your submission, and attach it under Presentation files: PowerPoint or PDF, up to 100 MB.

2. Be there at your session's time. Your session: {your session}

3. Keep to your time. You have 5 minutes in all, questions included: about 4 minutes to present and 1 for questions. You will be cut off when your time is up.

4. Plan on one slide per minute. About 4 slides fits your time.

5. Complete your presenter profile. A separate email will bring you a personal link to add your bio, photo, university and class year to the program.

6. Winners are announced at {awards session}.

{notes}

Questions? Reply to this email.

Best regards,
The {site} Team`;
}

/** What a submission needs for its placeholders to be filled in. */
export interface ReviewEmailSubmission {
  title?: string | null;
  message?: string | null;
  submissionType?: string | null;
  classificationType?: string | null;
  participants?: Array<{ name?: string | null }> | null;
  season?: Partial<SubmissionDeadlines> | null;
}

/**
 * A session as the email names it (#2985): an event of the season, with its day, its times as the event stores them
 * ("14:00:00 ..."), and where.
 */
export interface ReviewEmailSession {
  guid: string;
  name?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  day?: { date?: Date | string | null } | null;
  location?: { building?: string | null; room?: string | null } | null;
}

/** "2:00 PM" from an event's stored time, "14:00:00 ...". */
function clockTime(stored: string | null | undefined): string {
  const match = /^(\d{1,2}):(\d{2})/.exec(stored ?? '');

  if (!match) {
    return '';
  }

  const hours = Number(match[1]);

  return `${hours % 12 || 12}:${match[2]} ${hours < 12 ? 'AM' : 'PM'}`;
}

/**
 * A session's day in Central time (#3011): "Thu, Nov 19" short, as the emails give it, or "Thursday, November 19, 2026"
 * long, as the competition pages give it. Empty when the session has no day.
 */
export function sessionDay(session: ReviewEmailSession, style: 'short' | 'long' = 'short'): string {
  const date = session.day?.date ? new Date(session.day.date) : null;

  if (!date || isNaN(date.getTime())) {
    return '';
  }

  return formatCentral(
    date,
    style === 'short'
      ? { weekday: 'short', month: 'short', day: 'numeric' }
      : { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  );
}

/** A session's times (#3011): "1:00 to 1:15 PM", or "11:30 AM to 1:00 PM" across noon. */
export function sessionHours(session: ReviewEmailSession): string {
  const [start, end] = [clockTime(session.startTime), clockTime(session.endTime)];

  return start && end ? `${start.replace(/ (AM|PM)$/, end.endsWith(start.slice(-2)) ? '' : ' $1')} to ${end}` : start;
}

/** Where a session is (#3011): its building and room. */
export function sessionPlace(session: ReviewEmailSession): string {
  return [session.location?.building, session.location?.room].filter((part) => part?.trim()).join(' ');
}

/** "AWARDS: Winner Announcements, Thu, Nov 19, 1:00 to 1:15 PM, MSC Ballroom 2300 A&B: <link to the session>". */
export function sessionLine(session: ReviewEmailSession, address: string): string {
  const parts = [(session.name ?? '').trim(), sessionDay(session), sessionHours(session), sessionPlace(session)]
    .filter(Boolean)
    .join(', ');

  return `${parts}: ${address}/sessions/details/${session.guid}`;
}

/**
 * The finalist's own competition session among the season's (#2985), by the names the program gives them: a
 * `COMPETITION:` session naming posters, or for a presentation the one naming its level (undergraduate or graduate).
 */
export function competitionSession<T extends ReviewEmailSession>(
  sessions: Array<T> | null | undefined,
  submissionType: unknown,
  classificationType: unknown
): T | null {
  const competitions = (sessions ?? []).filter((s) => /^\s*competition\s*:/i.test(s.name ?? ''));
  const named = (word: RegExp) => competitions.find((s) => word.test(s.name ?? '')) ?? null;

  if (submissionType === 'poster') {
    return named(/poster/i);
  }

  if (submissionType !== 'presentation') {
    return null;
  }

  return classificationType === 'undergraduate'
    ? named(/undergraduate/i)
    : (competitions.find((s) => /graduate/i.test(s.name ?? '') && !/undergraduate/i.test(s.name ?? '')) ?? null);
}

/** The season's awards session for the poster and presentation competitions (#2985): an `AWARDS:` session naming either. */
export function awardsSession<T extends ReviewEmailSession>(sessions: Array<T> | null | undefined): T | null {
  return (
    (sessions ?? []).find((s) => /^\s*awards\s*:/i.test(s.name ?? '') && /poster|presentation/i.test(s.name ?? '')) ?? null
  );
}

/** Each placeholder's value for one submission, on one site. */
export function reviewEmailValues(
  submission: ReviewEmailSubmission,
  site: { name: string; address: string },
  /** The season's sessions, for the finalist's own and the awards session (#2985). */
  sessions?: Array<ReviewEmailSession> | null
): ReviewEmailValues {
  const firstName = (submission.participants?.[0]?.name ?? '').trim().split(/\s+/)[0];
  const deadline = closesAt(submission.season as SubmissionDeadlines, submission.submissionType, 'files');

  return {
    '{first name}': firstName || 'there',
    '{title}': (submission.title ?? '').trim(),
    '{upload deadline}': deadline ? inCentralTime(deadline) : 'the deadline shown on your submission',
    '{site}': site.name,
    '{site address}': site.address,
    '{your session}': ((own) => (own ? sessionLine(own, site.address) : `see ${site.address}/sessions`))(
      competitionSession(sessions, submission.submissionType, submission.classificationType)
    ),
    '{awards session}': ((awards) =>
      awards ? sessionLine(awards, site.address) : `the awards session; see ${site.address}/sessions`)(
      awardsSession(sessions)
    ),
    '{notes}': submission.message?.trim() ? `Additional notes: ${submission.message.trim()}` : ''
  };
}

/**
 * A template with its placeholders filled in. An empty placeholder on a line of its own leaves no gap: the blank lines
 * around it close up.
 */
export function fillReviewEmail(template: string, values: ReviewEmailValues): string {
  let text = template.replace(/\r\n/g, '\n');

  for (const [placeholder, value] of Object.entries(values)) {
    text = text.split(placeholder).join(value);
  }

  return text.replace(/\n{3,}/g, '\n\n').trim();
}
