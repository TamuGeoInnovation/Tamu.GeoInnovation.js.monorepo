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
