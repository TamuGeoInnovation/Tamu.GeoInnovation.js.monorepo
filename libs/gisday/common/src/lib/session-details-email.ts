import { ReviewEmailSession, sessionDay, sessionHours, sessionPlace } from './review-email';

/**
 * The email that brings a session's speakers its details (#3092): when and where it is, how to join it online, how
 * attendees check in, and what to bring. It is prefilled from the session, then read and edited in the window the
 * profile email uses before it is sent, as one kind, `session-details`, whose subject is editable too.
 *
 * The session's details are written into the text itself, so the admin sees and can change each of them; only the
 * speaker's first name and the site are filled in per person.
 */

/** The session details email's kind in the window, and so the key its text comes back under (its subject under `session-details:subject`). */
export const SESSION_DETAILS_EMAIL_KIND = 'session-details';

/** The placeholders it may use, filled in for each speaker. */
export const SESSION_DETAILS_EMAIL_PLACEHOLDERS = Object.freeze(['{first name}', '{site}', '{site address}'] as const);

/** A session as the email reads it: the review emails' session, with how it is held, its broadcast and its requirements. */
export interface SessionDetailsSession extends ReviewEmailSession {
  /** `in-person`, `hybrid` or `virtual`, as the event form sets it. */
  mode?: string | null;
  requirements?: string | null;
  /** The meeting a hybrid or virtual session is broadcast on, as its page shows it (#3055). */
  broadcast?: {
    publicUrl?: string | null;
    password?: string | null;
    phoneNumber?: string | null;
    meetingId?: string | null;
  } | null;
}

/** The longest subject and text an admin may send, as the profile email's. */
const MAX_SUBJECT = 200;
const MAX_TEMPLATE = 20000;

/** How much of a session's name the subject it starts from carries, so it stays within `MAX_SUBJECT`. */
const SUBJECT_NAME_LENGTH = 150;

/** Whether a session is broadcast, and so has a link and dial-in to give. */
function isOnline(session: SessionDetailsSession): boolean {
  return session.mode === 'hybrid' || session.mode === 'virtual';
}

/** The subject it starts from: the site and the session's name. */
export function sessionDetailsEmailSubject(session: SessionDetailsSession): string {
  const name = (session.name ?? '').trim();

  return `Your {site} session: ${name.length > SUBJECT_NAME_LENGTH ? `${name.slice(0, SUBJECT_NAME_LENGTH - 1)}…` : name}`;
}

/**
 * The text it starts from, for the session as it is saved (#3092): its name; its day and time in Central; its building
 * and room, or online; for a hybrid or virtual session, its broadcast's link, password, dial-in number and meeting ID, as
 * the session's page shows them; that attendees check in by the QR code shown at the session; and what to bring, from
 * its requirements. `address` is the site's, for the link to the session's page.
 */
export function sessionDetailsEmailTemplate(session: SessionDetailsSession, address: string): string {
  const name = (session.name ?? '').trim() || 'your session';
  const day = sessionDay(session, 'long');
  const hours = sessionHours(session);
  const when = day && hours ? `${day}, ${hours} Central` : day || 'To be announced';
  const room = sessionPlace(session);
  const where =
    session.mode === 'virtual' ? 'Online' : room ? (isOnline(session) ? `${room}, and online` : room) : 'To be announced';
  const requirements = (session.requirements ?? '').trim();

  return [
    'Howdy {first name},',
    `Thank you for presenting at {site}. Here are the details of your session, **${name}**.`,
    [`- **When:** ${when}`, `- **Where:** ${where}`, `- **Session page:** ${address}/sessions/details/${session.guid}`].join(
      '\n'
    ),
    isOnline(session) ? onlineDetails(session) : '',
    "**Check-in:** attendees check in by scanning the session's check-in QR code with their phone. The code is shown at the session and scanned there, so please leave a moment for it at the start.",
    requirements ? `**What to bring:**\n\n${requirements}` : '**What to bring:** the session lists no requirements.',
    'Questions? Reply to this email.',
    '— The {site} Team'
  ]
    .filter(Boolean)
    .join('\n\n');
}

/** A hybrid or virtual session's broadcast, as its page's Online Broadcast panel shows it (#3055). */
function onlineDetails(session: SessionDetailsSession): string {
  const br = session.broadcast;

  if (!br?.publicUrl?.trim()) {
    return "**Joining online:** The online link is not set yet. It will be on the session's page.";
  }

  return [
    '**Joining online:**',
    '',
    `- **Link:** ${br.publicUrl.trim()}`,
    br.password?.trim() ? `- **Password:** ${br.password.trim()}` : '',
    `- **Dial-in number:** ${br.phoneNumber?.trim() || 'None'}`,
    br.meetingId?.trim() ? `- **Meeting ID:** ${br.meetingId.trim()}` : ''
  ]
    .filter((line, i) => i === 1 || line)
    .join('\n');
}

/** Each placeholder's value for one speaker. */
export function sessionDetailsEmailValues(
  speaker: { firstName?: string | null },
  site: { name: string; address: string }
): Record<string, string> {
  return {
    '{first name}': speaker.firstName?.trim() || 'there',
    '{site}': site.name,
    '{site address}': site.address
  };
}

/** Why an edited email may not be sent, or null when it may: a subject and a text, each of a sensible size. */
export function sessionDetailsEmailProblem(email: unknown): string | null {
  const { subject, template } = (email ?? {}) as { subject?: unknown; template?: unknown };

  if (typeof subject !== 'string' || !subject.trim() || subject.length > MAX_SUBJECT) {
    return `The subject must be text, up to ${MAX_SUBJECT} characters.`;
  }

  if (typeof template !== 'string' || !template.trim() || template.length > MAX_TEMPLATE) {
    return `The email must be text, up to ${MAX_TEMPLATE} characters.`;
  }

  return null;
}
