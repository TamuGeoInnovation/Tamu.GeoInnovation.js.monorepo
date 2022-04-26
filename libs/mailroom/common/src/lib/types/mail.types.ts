export interface IMailroomEmailOutbound {
  recipientEmail: string;
  subjectLine: string;
  emailBodyText: string;
  emailBodyHtml?: string;
}

export interface INodeMailerSendMailResponse {
  messageId: string;
  envelope: string;
  accepted: string[];
  rejected: string[];
  pending: string[];
  response: string;
}

export enum EmailStatus {
  Accepted = 1,
  Rejected
}

export type MailroomOutbound = IMailroomEmailOutbound & { [key: string]: string | boolean | number };
