import { Injectable, Logger, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { EmailProvider, EmailAttachment } from '../email/email.provider';
import { SmsProvider } from './sms/sms.provider.interface';
import { NetSmsBdProvider } from './sms/netsmsbd.provider';
import { WhatsAppProvider } from './whatsapp/whatsapp.provider.interface';
import { MockWhatsAppProvider } from './whatsapp/mock-whatsapp.provider';
import { EmailTemplatesService } from '../email-templates/email-templates.service';
import { SmsTemplatesService } from '../sms-templates/sms-templates.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private smsProvider: SmsProvider;
  private whatsAppProvider: WhatsAppProvider;

  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly emailProvider: EmailProvider,
    private readonly emailTemplatesService: EmailTemplatesService,
    private readonly smsTemplatesService: SmsTemplatesService,
  ) {
    this.smsProvider = new NetSmsBdProvider();
    this.whatsAppProvider = new MockWhatsAppProvider();
  }

  async sendEmail(to: string, subject: string, text: string, html?: string, attachments?: EmailAttachment[]) {
    let status = 'sent';
    let error: string | null = null;
    let result = false;

    try {
      result = await this.emailProvider.sendEmail(to, subject, text, html, attachments);
      if (!result) {
          status = 'failed';
          error = 'Email provider returned false';
      }
    } catch (e) {
      status = 'failed';
      error = e.message;
      this.logger.error(`Failed to send email to ${to}`, e);
    }

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

  async sendTemplateEmail(to: string, templateName: string, variables: Record<string, any>, attachments?: EmailAttachment[]) {
    try {
      const template = await this.emailTemplatesService.findByName(templateName);
      if (!template) {
        this.logger.warn(`Email template '${templateName}' not found. Falling back to default.`);
        return false;
      }

      let subject = template.subject;
      let body = template.body;

      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, value);
        body = body.replace(regex, value);
      }

      return this.sendEmail(to, subject, body.replace(/<[^>]*>?/gm, ''), body, attachments);
    } catch (e) {
      this.logger.error(`Failed to send template email '${templateName}' to ${to}`, e);
      return false;
    }
  }

  async sendSMS(to: string, message: string) {
    const isSmsEnabled = process.env.SMS_ENABLED === 'true';
    const isWhatsAppEnabled = process.env.WHATSAPP_ENABLED === 'true';
    let status = 'sent';
    let error: string | null = null;
    let result = false;
    
    // Try WhatsApp first if enabled
    if (isWhatsAppEnabled) {
        try {
            const sent = await this.whatsAppProvider.send(to, message);
            if (sent) {
                this.logger.log(`Message sent via WhatsApp to ${to}`);
                result = true;
            }
        } catch (e) {
            this.logger.error(`Failed to send WhatsApp to ${to}`, e);
        }
    }

    // Fallback to SMS if WhatsApp failed or not enabled (and SMS is enabled)
    if (!result && isSmsEnabled) {
        try {
            result = await this.smsProvider.send(to, message);
            if (!result) {
                status = 'failed';
                error = 'SMS provider returned false';
            }
        } catch (e) {
            status = 'failed';
            error = e.message;
            this.logger.error(`Failed to send SMS to ${to}`, e);
        }
    } else if (!result && !isSmsEnabled) {
        this.logger.log(`[SMS Disabled] To: ${to} | Message: ${message}`);
        result = true; // Pretend success
    }

    // Log SMS
    try {
        await this.knex('sms_logs').insert({
            to,
            body: message,
            status,
            error
        });
    } catch (logError) {
        this.logger.error('Failed to log SMS', logError);
    }

    return result;
  }

  async sendTemplateSMS(to: string, templateName: string, variables: Record<string, any>) {
      try {
          const template = await this.smsTemplatesService.findByName(templateName);
          if (!template) {
              this.logger.warn(`SMS template '${templateName}' not found.`);
              return false;
          }

          let body = template.body;
          for (const [key, value] of Object.entries(variables)) {
              const regex = new RegExp(`{{${key}}}`, 'g');
              body = body.replace(regex, value);
          }

          return this.sendSMS(to, body);
      } catch (e) {
          this.logger.error(`Failed to send template SMS '${templateName}' to ${to}`, e);
          return false;
      }
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
      const sent = await this.sendTemplateEmail(to, 'verification_code', { otp });
      if (!sent) {
          return this.sendEmail(to, 'Verification Code', message);
      }
      return sent;
    } else if (channel === 'sms') {
      const sent = await this.sendTemplateSMS(to, 'verification_code', { otp });
      if (!sent) {
          return this.sendSMS(to, message);
      }
      return sent;
    } else if (channel === 'whatsapp') {
      return this.sendWhatsApp(to, message);
    }
  }
}
