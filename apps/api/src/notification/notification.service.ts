import { Injectable, Logger } from '@nestjs/common';
import { EmailProvider } from '../email/email.provider';
import { SmsProvider } from './sms/sms.provider.interface';
import { NetSmsBdProvider } from './sms/netsmsbd.provider';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private smsProvider: SmsProvider;

  constructor(private readonly emailProvider: EmailProvider) {
    // In the future, we can use a factory or dependency injection to switch providers
    // For now, we instantiate NetSmsBdProvider directly or via DI if registered
    this.smsProvider = new NetSmsBdProvider();
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    return this.emailProvider.sendEmail(to, subject, text, html);
  }

  async sendSMS(to: string, message: string) {
    const isEnabled = process.env.SMS_ENABLED === 'true';
    
    if (!isEnabled) {
      this.logger.log(`[SMS Disabled] To: ${to} | Message: ${message}`);
      return true; // Pretend success
    }

    return this.smsProvider.send(to, message);
  }

  async sendWhatsApp(to: string, message: string) {
    console.log(`[WhatsApp] To: ${to} | Message: ${message}`);
    return true;
  }

  async sendOTP(to: string, channel: 'email' | 'sms' | 'whatsapp', otp: string) {
    const message = `Your Prithibee verification code is: ${otp}. Valid for 5 minutes.`;
    
    if (channel === 'email') {
      return this.sendEmail(to, 'Verification Code', message);
    } else if (channel === 'sms') {
      return this.sendSMS(to, message);
    } else if (channel === 'whatsapp') {
      return this.sendWhatsApp(to, message);
    }
  }
}
