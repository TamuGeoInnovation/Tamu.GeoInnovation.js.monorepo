/**
 * Interface that describes the outbound email object.
 */
export interface IMailroomEmailOutbound {
  /**
   * Recipient of the email
   */
  to: string;

  /**
   * Sender of the email
   */
  from: string;

  /**
   * CC recipient of the email. Commas separate multiple recipients.
   */
  cc?: string;

  /**
   * BCC recipient of the email. Commas separate multiple recipients.
   */
  bcc?: string;

  /**
   * Subject of the email
   */
  subject: string;

  /**
   * Body of the email. Produces a plain email with only text. Can be used alone or with the html param.
   *
   * For clients that don't support HTML, this is the fallback.
   */
  text: string;

  /**
   * HTML to use for the email. Overrides the text param, if used.
   *
   * For clients that support HTML.
   */
  html?: string;

  /**
   * Attachments to include in the email.
   */
  attachments?: Express.Multer.File[];

  /**
   * Reply to address for the email.
   */
  replyTo?: string;
}

/**
 * Response from TAMU SMTP relay.
 */
export interface ITamuRelayResponse {
  accepted: string[];
  rejected: string[];
  envelopeTime: number;
  messageTime: number;
  messageSize: number;
  response: string;
  envelope: {
    from: string;
    to: string[];
  };
  messageId: string;
}

/**
 * Enums representing if the email was accepted by the TAMU SMTP relay.
 * Accepted means the relay accepted our email and is on its way
 * Rejected means the relay rejected our email for some reason
 */
export enum EmailStatus {
  Accepted = 1,
  Rejected
}

export type MailroomOutbound = IMailroomEmailOutbound & { [key: string]: string | boolean | number };
