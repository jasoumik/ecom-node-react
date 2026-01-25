import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'ethereal_user', // These need to be valid ethereal creds if not mocked
        pass: process.env.SMTP_PASS || 'ethereal_pass',
      },
    });
    
    // Auto-generate test account if no env vars (for true dev experience)
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
            console.log('📧 Ethereal Email Configured');
        });
    }
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"Prithibee" <noreply@prithibee.com>',
        to,
        subject,
        text,
        html: html || text,
      });
      
      console.log('Email sent: %s', info.messageId);
      
      // Log preview URL for Ethereal
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
          console.log('---------------------------------------------------');
          console.log('📧 Email Preview URL: %s', previewUrl);
          console.log('---------------------------------------------------');
      }
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
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
