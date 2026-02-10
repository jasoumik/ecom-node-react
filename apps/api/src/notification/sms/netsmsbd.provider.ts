import { Injectable, Logger } from '@nestjs/common';
import { SmsProvider } from './sms.provider.interface';

@Injectable()
export class NetSmsBdProvider implements SmsProvider {
  private readonly logger = new Logger(NetSmsBdProvider.name);
  private readonly apiKey: string;
  private readonly senderId: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = process.env.NETSMSBD_API_KEY || '';
    this.senderId = process.env.NETSMSBD_SENDER_ID || '';
    this.baseUrl = 'https://netsmsbd.com/v1.1/sms';
  }

  private formatMobileNumber(number: string): string {
    // Remove any non-digit characters
    let cleaned = number.replace(/\D/g, '');
    
    // If starts with 880, remove 88
    if (cleaned.startsWith('880')) {
      cleaned = cleaned.substring(2);
    }
    
    // If starts with +880 (handled by \D removal), but just in case
    
    return cleaned;
  }

  async send(to: string, message: string): Promise<boolean> {
    if (!this.apiKey) {
      this.logger.warn('NETSMSBD_API_KEY is not set. Skipping SMS.');
      return false;
    }

    const mobileNo = this.formatMobileNumber(to);

    try {
      const payload = {
        apiKey: this.apiKey,
        senderId: this.senderId, // Optional based on provider, but good to have
        mobileNo: mobileNo,
        msgBody: message,
      };

      // Remove senderId if empty to avoid errors if the API doesn't like empty strings
      if (!this.senderId) {
          delete (payload as any).senderId;
      }

      this.logger.log(`Sending SMS to ${mobileNo} via NetSmsBd...`);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      this.logger.log(`NetSmsBd Response: ${JSON.stringify(data)}`);

      // Assuming the API returns a success status or we check HTTP 200
      if (response.ok) {
          return true;
      } else {
          this.logger.error(`Failed to send SMS: ${response.statusText}`);
          return false;
      }
    } catch (error) {
      this.logger.error('Error sending SMS via NetSmsBd', error);
      return false;
    }
  }
}
