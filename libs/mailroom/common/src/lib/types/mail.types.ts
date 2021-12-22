
export interface IMailroomEmailOutbound {
    recipientEmail: string;
    subjectLine: string;
    emailBodyText: string;
    emailBodyHtml?: string;
  }