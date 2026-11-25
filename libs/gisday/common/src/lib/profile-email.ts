import { fillReviewEmail } from './review-email';
import { formatCentral } from './central-time';

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

/**
 * Why the profile email is only ever sent as a copy each (#3104), as the window says beside its tick boxes: each speaker's
 * link opens their own profile to anyone who has it, so one email to several would let each edit the others'.
 */
export const PROFILE_EMAIL_COPY_EACH =
  'Each speaker gets their own copy: it carries their own link to edit their profile, which no one else should have.';

/** The longest subject and text an admin may send. */
const MAX_SUBJECT = 200;
const MAX_TEMPLATE = 20000;

/** The subject it starts from: the one it has always had. */
export function profileEmailSubject(): string {
  return 'Update your {site} presenter profile';
}

/**
 * The text it starts from: the maintainer's for the competition finalists (#3045, 15 November 2026), with its parts as
 * placeholders. It opens from the Speakers list and an event too, where the admin can edit it for other presenters.
 */
export function profileEmailTemplate(): string {
  return `Howdy {first name},

One of the best ways for you to get a full-time or internship position is for you to present at TAMU GIS Day in a competition so that you can demonstrate your technical and soft skills  - like being able to explain technical things quickly - to an audience.

These are exactly the skills that employers look for but are nearly impossible to demonstrate on a resume alone.

Congratulations! You are already on your way. The excellent presentation you are about to give to a room full of employers is your opportunity to show your mastery of these important skills.

One key step of this is to have a professional bio that employers will be able to review while you are speaking, and afterwards as they are looking back at their notes of the presentations that they remember and the students they want to follow up with.

We ask that you please complete your bio on {site} so you will be visible on the presenters page when the employers are trying to look you up. Your basic details have already been filled in for you.

Without a bio or photo, you will not appear on the presenters page. Without a photo, they will still be able to dig to find your bio via the session you are in, but they will not remember your face - I promise you.

You can update your presenter profile on {site} - your bio, photo, university, class year, affiliation and link - here:

{edit link}

This link is yours alone and works until {link expires}. The {site} team reviews each change before it appears on the site.

If you did not expect this email, you can ignore it.

We look forward to your presentation and we wish you the best of luck in the competition!

— The Texas A&M GIS Day Team`;
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
    '{link expires}': formatCentral(expires, { weekday: 'long', month: 'long', day: 'numeric' })
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
  return personalLinkEmailProblem(email, '{edit link}');
}

/**
 * Why an edited email carrying each speaker's own link may not be sent, or null when it may: a subject and a text, each
 * of a sensible size, and the text must keep `placeholder`, where the link goes. The profile email's rule (#3023), and
 * the Ask to judge email's with its own link (#3183).
 */
export function personalLinkEmailProblem(email: unknown, placeholder: string): string | null {
  const { subject, template } = (email ?? {}) as { subject?: unknown; template?: unknown };

  if (typeof subject !== 'string' || !subject.trim() || subject.length > MAX_SUBJECT) {
    return `The subject must be text, up to ${MAX_SUBJECT} characters.`;
  }

  if (typeof template !== 'string' || !template.trim() || template.length > MAX_TEMPLATE) {
    return `The email must be text, up to ${MAX_TEMPLATE} characters.`;
  }

  return template.includes(placeholder) ? null : `The email must keep ${placeholder}, where each speaker’s own link goes.`;
}
