/**
 * @param {string} to - The recipient of the email
 * @param {string} from - Who is sending the email to the recipient
 * @param {string} subject - The subject of the email
 * @param {string} text - The body of the email. Produces a plain email with only text.
 * @param {string=} html - The html to use for the email. If you use html it will ignore the text param.
 * @param {string=} attachments - Attachments to include in the email.
 */
export interface IMailroomEmailOutbound {
  to: string;
  from: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: Express.Multer.File[];
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
