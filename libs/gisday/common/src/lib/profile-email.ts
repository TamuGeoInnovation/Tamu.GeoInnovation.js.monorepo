import { fillReviewEmail } from './review-email';

/**
 * The email that brings a speaker their own link to edit their presenter profile (#2936), as a template the admin reads
 * and can edit before it is sent (#3023), from the Speakers list, an event, or Research Competitions. It is shown and
 * edited in the review emails' window, as one kind, `profile`, whose subject is editable too.
 */

/** The profile email's kind in the window, and so the key its text comes back under (its subject under `profile:subject`). */
export const PROFILE_EMAIL_KIND = 'profile';

/** The placeholders it may use, filled in for each speaker. */
export const PROFILE_EMAIL_PLACEHOLDERS = Object.freeze([
  '{first name}',
  '{site}',
  '{site address}',
  '{edit link}',
  '{link expires}'
] as const);

/**
 * What the preview shows for `{edit link}`. Each speaker's own link is made only when their email is sent, so no real
 * link is ever shown, and an edit to the text cannot break one.
 */
export const PROFILE_EDIT_LINK_PREVIEW = '(their own edit link, added when it is sent)';

/** The longest subject and text an admin may send. */
const MAX_SUBJECT = 200;
const MAX_TEMPLATE = 20000;

/** The subject it starts from: the one it has always had. */
export function profileEmailSubject(): string {
  return 'Update your {site} presenter profile';
}

/** The text it starts from: the one it has always had, with its parts as placeholders. */
export function profileEmailTemplate(): string {
  return `Howdy {first name},

You can update your presenter profile on {site} - your bio, photo, university, class year, affiliation and link - here:

{edit link}

This link is yours alone and works until {link expires}. The {site} team reviews each change before it appears on the site.

If you did not expect this email, you can ignore it.`;
}

/** Each placeholder's value for one speaker: `link` is their own, or `PROFILE_EDIT_LINK_PREVIEW` in a preview. */
export function profileEmailValues(
  speaker: { firstName?: string | null },
  site: { name: string; address: string },
  link: string,
  expires: Date
): Record<string, string> {
  return {
    '{first name}': speaker.firstName?.trim() || 'there',
    '{site}': site.name,
    '{site address}': site.address,
    '{edit link}': link,
    '{link expires}': expires.toLocaleDateString('en-US', {
      timeZone: 'America/Chicago',
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  };
}

/** The email as one speaker gets it: its subject and text, each with its placeholders filled in. */
export function fillProfileEmail(email: { subject: string; template: string }, values: Record<string, string>) {
  return { subject: fillReviewEmail(email.subject, values), text: fillReviewEmail(email.template, values) };
}

/**
 * Why an edited email may not be sent, or null when it may (#3023): a subject and a text, each of a sensible size, and
 * the text must keep `{edit link}`, or the speaker would get no way in.
 */
export function profileEmailProblem(email: unknown): string | null {
  const { subject, template } = (email ?? {}) as { subject?: unknown; template?: unknown };

  if (typeof subject !== 'string' || !subject.trim() || subject.length > MAX_SUBJECT) {
    return `The subject must be text, up to ${MAX_SUBJECT} characters.`;
  }

  if (typeof template !== 'string' || !template.trim() || template.length > MAX_TEMPLATE) {
    return `The email must be text, up to ${MAX_TEMPLATE} characters.`;
  }

  return template.includes('{edit link}') ? null : 'The email must keep {edit link}, where each speaker’s own link goes.';
}
