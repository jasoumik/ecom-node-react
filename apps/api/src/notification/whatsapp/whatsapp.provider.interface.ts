export interface WhatsAppProvider {
  send(to: string, message: string): Promise<boolean>;
}
