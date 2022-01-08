export interface IMailroomEmailOutbound {
  emailGuid: string;
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
  Rejected = 2,
  Accepted = 1,
  InTransit = 0
}

export type MailroomOutbound = IMailroomEmailOutbound & Object;
