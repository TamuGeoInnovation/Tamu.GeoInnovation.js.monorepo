/**
 * Which address an admin's email is sent as (#3100): their own, the site's, or a shared address the API is configured
 * with. The email composer offers the choices the API lists, and every send route that uses the composer checks the one
 * chosen against the admin's token and the configuration before anything is sent.
 */

/** The one domain an email may be sent as: a From outside it fails the receiving server's DMARC check. */
export const SENDER_DOMAIN = 'tamu.edu';

/**
 * The key the composer's choice comes back under, beside the texts of each kind and `<kind>:subject`. It has no kind
 * before its colon, so it cannot be taken for one.
 */
export const EMAIL_SENDER_KEY = ':sender';

/** One address an admin may send as. */
export interface EmailSenderChoice {
  /** The address itself, as the send routes take it in `sender`. */
  address: string;

  /** What the box shows, such as "Your address (jdoe@tamu.edu)". */
  label: string;

  /** The From header recipients see, such as `"Jane Doe (TxGIS Day)" <jdoe@tamu.edu>`. */
  from: string;

  /** Where replies go. */
  replyTo: string;

  /** `own`: the signed-in admin's; `site`: the site's own (`MAILROOM_FROM`); `shared`: one in `MAILROOM_SENDERS`. */
  kind: 'own' | 'site' | 'shared';
}

/** The choices for the signed-in admin, the first the default, and any address of theirs that cannot be offered, with why. */
export interface EmailSenderChoices {
  choices: Array<EmailSenderChoice>;
  unavailable: Array<{ address: string; reason: string }>;
}

/** Whether an address is in `SENDER_DOMAIN` itself (not a subdomain, nor a domain that merely ends in it). */
export function isSenderDomain(address: string | null | undefined): boolean {
  const text = (address ?? '').trim().toLowerCase();
  const at = text.lastIndexOf('@');

  return at > 0 && text.slice(at + 1) === SENDER_DOMAIN;
}

/** The composer's result split into the chosen sender, if any, and the texts by kind. */
export function withoutSender(result: Record<string, string> | null | undefined): {
  sender?: string;
  texts: Record<string, string>;
} {
  const texts = { ...(result ?? {}) };
  const sender = texts[EMAIL_SENDER_KEY];

  delete texts[EMAIL_SENDER_KEY];

  return sender ? { sender, texts } : { texts };
}
