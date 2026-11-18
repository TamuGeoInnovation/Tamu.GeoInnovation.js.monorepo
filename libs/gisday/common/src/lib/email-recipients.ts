import { lastNameOf } from './names';

/**
 * Which of an email's speakers get it, and whether together or a copy each (#3104). Every speaker email the composer sends
 * (the profile email, the session details email, and any to come, such as the slides request) lists its speakers in its
 * preview as `recipients`; the composer shows each with a tick box, all ticked to start, and when more than one is ticked
 * offers one email to all of them together, the default, or a copy each.
 *
 * Together, every ticked speaker is on the To line of one email, and `{first name}`, which has one value per copy, names
 * them all: "Sharmin and Colby", "Ana, Ben and Cara".
 */

/**
 * The keys the composer's choice comes back under, beside the texts of each kind and the sender (`EMAIL_SENDER_KEY`). Like
 * it, each has no kind before its colon, so it cannot be taken for one.
 */
export const EMAIL_RECIPIENTS_KEY = ':recipients';
export const EMAIL_TOGETHER_KEY = ':together';

/** The placeholder each copy fills with its speaker's first name, and a together email with all of theirs. */
export const FIRST_NAME_PLACEHOLDER = '{first name}';

/** One speaker an email can go to, as its preview lists them: only those with an address. */
export interface EmailRecipient {
  /** The speaker's id, as the send routes take it in `speakers`. */
  guid: string;

  /** Their full name, as the composer lists them. */
  name: string;

  /** What `{first name}` is for them; empty when their record has none. */
  firstName: string;

  /** The address it is sent to. */
  email: string;

  /** What they were sent before (#3167), when the API keeps a record of it. */
  sends?: EmailSends;
}

/**
 * What one speaker was sent before (#3167), as a preview lists it: when they were sent the email about to be sent (that
 * email, and for a session's email that session), newest first, and every other email they were sent. Times are ISO.
 */
export interface EmailSends {
  thisEmail: Array<string>;
  others: Array<{ kind: string; at: string }>;
}

/** What each speaker email is called where the record of sends is shown (#3167), by its kind. */
export const EMAIL_KIND_LABELS: Readonly<Record<string, string>> = Object.freeze({
  profile: 'the presenter profile email',
  'session-details': 'a session details email',
  'slides-request': 'an Ask for slides email',
  // Each judge's own judging link (#3183).
  judging: 'an Ask to judge email'
});

/** A time as the record of sends shows it: "Nov 16, 4:05 PM", in US Central, where GIS Day is. */
export function sentAt(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

/** Whether a speaker was ever sent the email about to be sent (#3167). */
export function wasSent(recipient: { sends?: EmailSends }): boolean {
  return (recipient.sends?.thisEmail.length ?? 0) > 0;
}

/**
 * The line under a speaker's name saying whether they were sent this email (#3167): "Not sent yet", or "Sent 2 times,
 * last Nov 16, 4:05 PM". Empty when the API gave no record.
 */
export function sendsLine(recipient: { sends?: EmailSends }): string {
  const sends = recipient.sends;

  if (!sends) {
    return '';
  }

  const n = sends.thisEmail.length;

  if (n === 0) {
    return 'Not sent yet';
  }

  return `Sent ${n === 1 ? 'once' : `${n} times`}, last ${sentAt(sends.thisEmail[0])}`;
}

/**
 * Every time a speaker was sent this email and any other (#3167), newest first, for the list a speaker's line opens:
 * "Nov 16, 4:05 PM: this email", "Nov 15, 2:10 PM: the presenter profile email".
 */
export function sendsDetail(recipient: { sends?: EmailSends }): Array<string> {
  const sends = recipient.sends;

  if (!sends) {
    return [];
  }

  return [
    ...sends.thisEmail.map((at) => ({ at, what: 'this email' })),
    ...sends.others.map((o) => ({ at: o.at, what: EMAIL_KIND_LABELS[o.kind] ?? o.kind }))
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .map((s) => `${sentAt(s.at)}: ${s.what}`);
}

/** The speakers with those not yet sent this email first (#3167), each part keeping the order it was given. */
export function notSentFirst<T extends { sends?: EmailSends }>(recipients: ReadonlyArray<T>): Array<T> {
  return [...recipients.filter((r) => !wasSent(r)), ...recipients.filter((r) => wasSent(r))];
}

/** The value `{first name}` takes when a speaker's record has none, as in every speaker email. */
const NO_FIRST_NAME = 'there';

/** Names as a sentence lists them: "Ana", "Ana and Ben", "Ana, Ben and Cara". Empty for none. */
export function joinNames(names: ReadonlyArray<string>): string {
  const listed = names.map((n) => (n ?? '').trim()).filter(Boolean);

  if (listed.length <= 1) {
    return listed[0] ?? '';
  }

  return `${listed.slice(0, -1).join(', ')} and ${listed[listed.length - 1]}`;
}

/** What `{first name}` is in one email to all of them together: their first names joined, or "there" when none has one. */
export function togetherFirstNames(recipients: ReadonlyArray<{ firstName?: string | null }>): string {
  return joinNames(recipients.map((r) => r.firstName ?? '')) || NO_FIRST_NAME;
}

/** The To line of one email to all of them together: each address, as the mail server reads a list. */
export function togetherTo(recipients: ReadonlyArray<{ email: string }>): string {
  return recipients.map((r) => r.email.trim()).join(', ');
}

/**
 * The speakers in order by last name, then first, as the composer lists them (#3142, the maintainer's call, 16 November
 * 2026), ignoring case and accents; a new list, so the one given is left as it was. Their ticks, the preview's example
 * and the send all follow this order.
 */
export function alphabetical<T extends { name: string; firstName?: string | null }>(
  recipients: ReadonlyArray<T> | null | undefined
): Array<T> {
  const compare = (a: string, b: string) => a.localeCompare(b, 'en', { sensitivity: 'base' });

  return [...(recipients ?? [])].sort(
    (a, b) =>
      compare(lastNameOf(a.name, a.firstName), lastNameOf(b.name, b.firstName)) ||
      compare((a.name ?? '').trim(), (b.name ?? '').trim())
  );
}

/** The composer's result split into the speakers ticked and whether together, when it listed any, and the rest. */
export function withoutRecipients(result: Record<string, string> | null | undefined): {
  speakers?: Array<string>;
  together?: boolean;
  rest: Record<string, string>;
} {
  const rest = { ...(result ?? {}) };
  const ticked = rest[EMAIL_RECIPIENTS_KEY];
  const together = rest[EMAIL_TOGETHER_KEY] === 'true';

  delete rest[EMAIL_RECIPIENTS_KEY];
  delete rest[EMAIL_TOGETHER_KEY];

  return {
    ...(ticked === undefined ? {} : { speakers: ticked.split(',').filter(Boolean) }),
    ...(together ? { together } : {}),
    rest
  };
}
