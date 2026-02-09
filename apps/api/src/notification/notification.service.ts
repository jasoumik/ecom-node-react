import { Injectable } from '@nestjs/common';
import { EmailProvider } from '../email/email.provider';

@Injectable()
export class NotificationService {
  constructor(private readonly emailProvider: EmailProvider) {}

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    return this.emailProvider.sendEmail(to, subject, text, html);
  }

  async sendSMS(to: string, message: string) {
    console.log(`[SMS] To: ${to} | Message: ${message}`);
    return true;
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
