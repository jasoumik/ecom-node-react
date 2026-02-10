import { Injectable, Logger } from '@nestjs/common';
import { EmailProvider } from '../email/email.provider';
import { SmsProvider } from './sms/sms.provider.interface';
import { NetSmsBdProvider } from './sms/netsmsbd.provider';
import { WhatsAppProvider } from './whatsapp/whatsapp.provider.interface';
import { MockWhatsAppProvider } from './whatsapp/mock-whatsapp.provider';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private smsProvider: SmsProvider;
  private whatsAppProvider: WhatsAppProvider;

  constructor(private readonly emailProvider: EmailProvider) {
    // In the future, we can use a factory or dependency injection to switch providers
    // For now, we instantiate NetSmsBdProvider directly or via DI if registered
    this.smsProvider = new NetSmsBdProvider();
    this.whatsAppProvider = new MockWhatsAppProvider();
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    return this.emailProvider.sendEmail(to, subject, text, html);
  }

  async sendSMS(to: string, message: string) {
    const isSmsEnabled = process.env.SMS_ENABLED === 'true';
    const isWhatsAppEnabled = process.env.WHATSAPP_ENABLED === 'true';
    
    // Try WhatsApp first if enabled
    if (isWhatsAppEnabled) {
        try {
            const sent = await this.whatsAppProvider.send(to, message);
            if (sent) {
                this.logger.log(`Message sent via WhatsApp to ${to}`);
                // If WhatsApp is successful, we might want to skip SMS to save cost, 
                // or send both depending on requirement. For now, let's assume we skip SMS if WhatsApp works.
                // But usually WhatsApp is not guaranteed to be delivered if user doesn't have it.
                // Since we don't have a way to check if user has WhatsApp without trying, 
                // and Mock provider always returns true, we might skip SMS.
                // However, for reliability, we might want to fallback to SMS if WhatsApp fails.
                
                // For this implementation, let's just log it and proceed to SMS check 
                // or return true if we want to prioritize WhatsApp.
                // Let's assume we want to send SMS as fallback or if WhatsApp is just an additional channel.
                
                // If the requirement is "send him sms through whatsapp", it implies WhatsApp is the medium.
                return true; 
            }
        } catch (e) {
            this.logger.error(`Failed to send WhatsApp to ${to}`, e);
            // Fallback to SMS
        }
    }

    if (!isSmsEnabled) {
      this.logger.log(`[SMS Disabled] To: ${to} | Message: ${message}`);
      return true; // Pretend success
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
      return this.sendEmail(to, 'Verification Code', message);
    } else if (channel === 'sms') {
      return this.sendSMS(to, message);
    } else if (channel === 'whatsapp') {
      return this.sendWhatsApp(to, message);
    }
  }
}
