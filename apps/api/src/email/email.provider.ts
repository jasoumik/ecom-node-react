export abstract class EmailProvider {
  abstract sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean>;
}
