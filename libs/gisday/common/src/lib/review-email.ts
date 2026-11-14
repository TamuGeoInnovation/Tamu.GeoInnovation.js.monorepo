import { closesAt, inCentralTime, SubmissionDeadlines } from './submission-deadlines';

/**
 * The email a student gets when their competition submission is reviewed (#2957, #2980), as a template the reviewer sees
 * and can edit before it is sent (#2981). The same template serves one submission or many: each placeholder is filled in
 * for each submission.
 */

/** Which email a decision sends: a poster finalist's, a presenter's, or a rejection. */
export type ReviewEmailKind = 'poster' | 'presentation' | 'rejection';

/** The placeholders a template may use, filled in for each submission. */
export const REVIEW_EMAIL_PLACEHOLDERS = Object.freeze([
  '{first name}',
  '{title}',
  '{upload deadline}',
  '{site}',
  '{site address}',
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

/** What each kind is called where the reviewer chooses its text. */
export function reviewEmailKindLabel(kind: ReviewEmailKind): string {
  return kind === 'poster' ? 'Accepted posters' : kind === 'presentation' ? 'Accepted presentations' : 'Rejections';
}

/** The email's subject, naming the site and the decision. */
export function reviewEmailSubject(acceptance: boolean, siteName: string): string {
  return acceptance ? `Your ${siteName} submission has been accepted` : `Your ${siteName} submission`;
}

/** The text each kind starts from, before the reviewer edits it. */
export function reviewEmailTemplate(kind: ReviewEmailKind): string {
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

3. Set up early. Please have your poster up as early in the day as you can: the judges walk the poster area all day, and the earlier it is up, the more of them see it. See {site address}/sessions for the poster session's place and times.

4. Be there to win. You, or at least one member of your team, must be at your poster during the competition to be eligible for an award.

5. Complete your presenter profile. A separate email will bring you a personal link to add your bio, photo, university and class year to the program.

6. Join us at the Awards and Networking session, where the winners are announced.

{notes}

Questions? Reply to this email.

Best regards,
The {site} Team`;
  }

  return `Howdy {first name},

Congratulations! Your presentation submission, "{title}", has been accepted for {site}.

What to do next:

1. Attach your slides by {upload deadline}. Sign in at {site address}/account/submissions, open your submission, and attach them under Presentation files: PowerPoint or PDF, up to 100 MB each.

2. Complete your presenter profile. A separate email will bring you a personal link to add your bio, photo, university and class year to the program.

3. Check your session. See {site address}/sessions for when you present.

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
  participants?: Array<{ name?: string | null }> | null;
  season?: Partial<SubmissionDeadlines> | null;
}

/** Each placeholder's value for one submission, on one site. */
export function reviewEmailValues(
  submission: ReviewEmailSubmission,
  site: { name: string; address: string }
): ReviewEmailValues {
  const firstName = (submission.participants?.[0]?.name ?? '').trim().split(/\s+/)[0];
  const deadline = closesAt(submission.season as SubmissionDeadlines, submission.submissionType, 'files');

  return {
    '{first name}': firstName || 'there',
    '{title}': (submission.title ?? '').trim(),
    '{upload deadline}': deadline ? inCentralTime(deadline) : 'the deadline shown on your submission',
    '{site}': site.name,
    '{site address}': site.address,
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
