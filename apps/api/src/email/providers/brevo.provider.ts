import { Injectable, Logger } from '@nestjs/common';
import { EmailProvider, EmailAttachment } from '../email.provider';

@Injectable()
export class BrevoEmailProvider extends EmailProvider {
  private readonly logger = new Logger(BrevoEmailProvider.name);
  private readonly apiKey: string;
  private readonly senderEmail: string;
  private readonly senderName: string;

  constructor() {
    super();
    this.apiKey = process.env.BREVO_API_KEY || '';
    this.senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@prithibee.com';
    this.senderName = process.env.BREVO_SENDER_NAME || 'Prithibee';

    if (!this.apiKey) {
      this.logger.warn('BREVO_API_KEY is not set. Email sending will fail.');
    }
  }

  async sendEmail(to: string, subject: string, text: string, html?: string, attachments?: EmailAttachment[]): Promise<boolean> {
    if (!this.apiKey) {
      this.logger.error('Cannot send email: BREVO_API_KEY is missing');
      return false;
    }

    try {
      const payload: any = {
        sender: {
          name: this.senderName,
          email: this.senderEmail,
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html || text,
        textContent: text,
      };

      if (attachments && attachments.length > 0) {
        payload.attachment = attachments.map((att) => {
          let contentStr = '';
          if (Buffer.isBuffer(att.content)) {
            contentStr = att.content.toString('base64');
          } else {
            contentStr = Buffer.from(att.content).toString('base64');
          }

          return {
            name: att.filename,
            content: contentStr,
          };
        });
      }

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': this.apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error(`Brevo API Error: ${JSON.stringify(errorData)}`);
        return false;
      }

      const data = await response.json();
      this.logger.log(
        `Email sent successfully via Brevo. MessageId: ${data.messageId}`,
      );
      return true;
    } catch (error) {
      this.logger.error('Error sending email via Brevo:', error);
      return false;
    }
  }
}
