import { Injectable, Logger } from '@nestjs/common';
import { WhatsAppProvider } from './whatsapp.provider.interface';

@Injectable()
export class MockWhatsAppProvider implements WhatsAppProvider {
  private readonly logger = new Logger(MockWhatsAppProvider.name);

  async send(to: string, message: string): Promise<boolean> {
    this.logger.log(`[Mock WhatsApp] Sending message to ${to}: ${message}`);
    return true;
  }
}
