export interface IMailroomEmailOutbound {
  to: string;
  from: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: Express.Multer.File[];
}

export interface INodeMailerSendMailResponse {
  messageId: string;
  envelope: string;
  accepted: string[];
  rejected: string[];
  pending: string[];
  response: string;
}

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

export enum EmailStatus {
  Accepted = 1,
  Rejected
}

export type MailroomOutbound = IMailroomEmailOutbound & { [key: string]: string | boolean | number };
