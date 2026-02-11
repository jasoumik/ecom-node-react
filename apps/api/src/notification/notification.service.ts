import { Injectable, Logger, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { EmailProvider } from '../email/email.provider';
import { SmsProvider } from './sms/sms.provider.interface';
import { NetSmsBdProvider } from './sms/netsmsbd.provider';
import { WhatsAppProvider } from './whatsapp/whatsapp.provider.interface';
import { MockWhatsAppProvider } from './whatsapp/mock-whatsapp.provider';
import { EmailTemplatesService } from '../email-templates/email-templates.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private smsProvider: SmsProvider;
  private whatsAppProvider: WhatsAppProvider;

  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly emailProvider: EmailProvider,
    private readonly emailTemplatesService: EmailTemplatesService,
  ) {
    this.smsProvider = new NetSmsBdProvider();
    this.whatsAppProvider = new MockWhatsAppProvider();
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    let status = 'sent';
    let error = null;
    let result = false;

    try {
      result = await this.emailProvider.sendEmail(to, subject, text, html);
      if (!result) {
          status = 'failed';
          error = 'Email provider returned false';
      }
    } catch (e) {
      status = 'failed';
      error = e.message;
      this.logger.error(`Failed to send email to ${to}`, e);
    }

    // Log email
    try {
        await this.knex('email_logs').insert({
            to,
            subject,
            body: html || text,
            status,
            error
        });
    } catch (logError) {
        this.logger.error('Failed to log email', logError);
    }

    return result;
  }

  async sendTemplateEmail(to: string, templateName: string, variables: Record<string, any>) {
    try {
      const template = await this.emailTemplatesService.findByName(templateName);
      if (!template) {
        this.logger.warn(`Email template '${templateName}' not found. Falling back to default.`);
        return false;
      }

      let subject = template.subject;
      let body = template.body;

      // Replace variables
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, value);
        body = body.replace(regex, value);
      }

      return this.sendEmail(to, subject, body.replace(/<[^>]*>?/gm, ''), body);
    } catch (e) {
      this.logger.error(`Failed to send template email '${templateName}' to ${to}`, e);
      return false;
    }
  }

  async sendSMS(to: string, message: string) {
    const isSmsEnabled = process.env.SMS_ENABLED === 'true';
    const isWhatsAppEnabled = process.env.WHATSAPP_ENABLED === 'true';
    
    if (isWhatsAppEnabled) {
        try {
            const sent = await this.whatsAppProvider.send(to, message);
            if (sent) {
                this.logger.log(`Message sent via WhatsApp to ${to}`);
                return true; 
            }
        } catch (e) {
            this.logger.error(`Failed to send WhatsApp to ${to}`, e);
        }
    }

    if (!isSmsEnabled) {
      this.logger.log(`[SMS Disabled] To: ${to} | Message: ${message}`);
      return true;
    }

    return this.smsProvider.send(to, message);
  }

  async sendWhatsApp(to: string, message: string) {
    const isEnabled = process.env.WHATSAPP_ENABLED === 'true';
    if (!isEnabled) {
        this.logger.log(`[WhatsApp Disabled] To: ${to} | Message: ${message}`);
        return true;
    }
    return this.whatsAppProvider.send(to, message);
  }

  async sendOTP(to: string, channel: 'email' | 'sms' | 'whatsapp', otp: string) {
    const message = `Your Prithibee verification code is: ${otp}. Valid for 5 minutes.`;
    
    if (channel === 'email') {
      // Use template if available
      const sent = await this.sendTemplateEmail(to, 'verification_code', { otp });
      if (!sent) {
          return this.sendEmail(to, 'Verification Code', message);
      }
      return sent;
    } else if (channel === 'sms') {
      return this.sendSMS(to, message);
    } else if (channel === 'whatsapp') {
      return this.sendWhatsApp(to, message);
    }
  }
}
