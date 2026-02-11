export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export abstract class EmailProvider {
  abstract sendEmail(to: string, subject: string, text: string, html?: string, attachments?: EmailAttachment[]): Promise<boolean>;
}
