import { PROFILE_EMAIL_PLACEHOLDERS, profileEmailProblem } from './profile-email';
import { SessionDetailsSession, sessionWhen, sessionWhere } from './session-details-email';
import { SESSION_FILES_RULE } from './submission-files';

/**
 * The email that asks a session's speakers for their slides (#3113), the third in a session's "Email these speakers" menu.
 * It is prefilled from the session (its name, day, time in Central and room) and with what may be uploaded in the upload
 * rule's own words, then read and edited in the composer the other speaker emails use, as one kind, `slides-request`.
 *
 * Each copy carries that speaker's own edit link, the one the profile email sends, which opens their presenter page, where
 * "Your sessions" takes their slides (#3093). So it only ever goes as a copy each (decided 1A, 15 November 2026), and its
 * placeholders, and its rule that the link must stay, are the profile email's.
 */

/** The Ask for slides email's kind in the composer, and so the key its text comes back under (its subject under `slides-request:subject`). */
export const SLIDES_REQUEST_EMAIL_KIND = 'slides-request';

/** The placeholders it may use, filled in for each speaker: the profile email's, with their own `{edit link}`. */
export const SLIDES_REQUEST_EMAIL_PLACEHOLDERS = PROFILE_EMAIL_PLACEHOLDERS;

/** Why it is only ever sent as a copy each, as the composer says beside its tick boxes (#3104). */
export const SLIDES_REQUEST_COPY_EACH =
  'Each speaker gets their own copy: it carries their own link to upload their slides, which no one else should have.';

/** How much of a session's name the subject carries, as the session details email's, so it stays within its limit. */
const SUBJECT_NAME_LENGTH = 150;

/** The subject it starts from: the site and the session's name. */
export function slidesRequestEmailSubject(session: Pick<SessionDetailsSession, 'name'>): string {
  const name = (session.name ?? '').trim();

  return `Your slides for {site}: ${name.length > SUBJECT_NAME_LENGTH ? `${name.slice(0, SUBJECT_NAME_LENGTH - 1)}…` : name}`;
}

/**
 * The text it starts from, for the session as it is saved: its name, its day and time in Central and its room, as the
 * session details email says them; where to upload, the speaker's own `{edit link}`; and what may be uploaded, from the
 * upload rule.
 *
 * @param designed Whether the email goes in Texas A&M's design (`hasEmailDesign`), whose details box already says when
 * and where: the text then leaves them out, so they are said once, as the session details email does (#3126).
 */
export function slidesRequestEmailTemplate(session: SessionDetailsSession, designed = false): string {
  const name = (session.name ?? '').trim() || 'your session';

  return [
    'Howdy {first name},',
    `Thank you for presenting at {site}. Please upload your slides for your session, **${name}**, so the {site} team has them before the day.`,
    designed ? '' : [`- **When:** ${sessionWhen(session)}`, `- **Where:** ${sessionWhere(session)}`].join('\n'),
    '**Upload them here:** {edit link}',
    'This link is yours alone and works until {link expires}. Under **Your sessions**, choose **Upload slides** for this session. Your files are saved as soon as you choose them.',
    `**What you can upload:** ${SESSION_FILES_RULE}`,
    'Questions? Reply to this email.',
    '— The {site} Team'
  ]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Why an edited email may not be sent, or null when it may: the profile email's rule, a subject and a text of a sensible
 * size, and the text must keep `{edit link}`, or the speaker would have nowhere to upload.
 */
export function slidesRequestEmailProblem(email: unknown): string | null {
  return profileEmailProblem(email);
}
