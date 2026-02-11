import { Injectable, Logger } from '@nestjs/common';
import { EmailProvider, EmailAttachment } from '../email.provider';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NodemailerProvider extends EmailProvider {
  private transporter;
  private readonly logger = new Logger(NodemailerProvider.name);

  constructor() {
    super();
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'ethereal_user',
        pass: process.env.SMTP_PASS || 'ethereal_pass',
      },
    });

    if (!process.env.SMTP_HOST) {
        nodemailer.createTestAccount().then(account => {
            this.transporter = nodemailer.createTransport({
                host: account.smtp.host,
                port: account.smtp.port,
                secure: account.smtp.secure,
                auth: {
                    user: account.user,
                    pass: account.pass,
                },
            });
            this.logger.log('📧 Ethereal Email Configured (Fallback)');
        });
    }
  }

  async sendEmail(to: string, subject: string, text: string, html?: string, attachments?: EmailAttachment[]): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"Prithibee" <noreply@prithibee.com>',
        to,
        subject,
        text,
        html: html || text,
        attachments: attachments,
      });
      
      this.logger.log(`Email sent via Nodemailer: ${info.messageId}`);
      
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
          this.logger.log(`📧 Email Preview URL: ${previewUrl}`);
      }
      
      return true;
    } catch (error) {
      this.logger.error('Error sending email via Nodemailer:', error);
      return false;
    }
  }
}
