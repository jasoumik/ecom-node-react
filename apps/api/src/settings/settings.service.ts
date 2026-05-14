import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async onModuleInit() {
      await this.ensureDefaults();
  }

  async ensureDefaults() {
      const defaults = [
          { key: 'payment_methods', value: 'bKash,Nagad,Visa,Mastercard,COD', description: 'Available payment methods (comma separated)' },
          { key: 'support_email', value: 'support@prithibee.com', description: 'Support email address' },
          { key: 'shop_name', value: 'Prithibee', description: 'Name of the shop displayed in header/footer' },
          { key: 'shop_name_bn', value: 'পৃথিবী', description: 'Name of the shop in Bangla' },
          { key: 'shop_phone', value: '+880 1616-684803', description: 'Primary contact number' },
          { key: 'shop_address', value: 'Uttara Model Town, Dhaka-1230', description: 'Physical store address' },
          { key: 'facebook_link', value: 'https://www.facebook.com/prithibeeofficial', description: 'Facebook page URL' },
          { key: 'whatsapp_number', value: '+8801616684803', description: 'WhatsApp number for chat button' },
          { key: 'free_shipping_threshold', value: '5000', description: 'Minimum order amount for free shipping' },
          { key: 'inventory_method', value: 'FIFO', description: 'Inventory valuation method: FIFO or LIFO' },
          { key: 'currency', value: 'BDT', description: 'Default currency' },
          { key: 'currency_symbol', value: '৳', description: 'Currency symbol' },
          { key: 'bkash_number', value: '01XXXXXXXXX', description: 'Personal bKash number for payments' },
          { key: 'nagad_number', value: '01XXXXXXXXX', description: 'Personal Nagad number for payments' },
          { key: 'watermark_enabled', value: 'false', description: 'Enable watermark on uploaded images' },
          { key: 'watermark_type', value: 'text', description: 'Watermark type: text or image' },
          { key: 'watermark_text', value: 'Your Brand', description: 'Text to display as watermark' },
          { key: 'watermark_image', value: '', description: 'URL of watermark image (used when type is image)' },
          { key: 'watermark_opacity', value: '0.5', description: 'Watermark opacity (0.1 to 1.0)' },
          { key: 'watermark_position', value: 'southeast', description: 'Watermark position: northwest, northeast, southwest, southeast, center' },
          { key: 'watermark_size', value: '200', description: 'Watermark image width in pixels' },
      ];

      for (const setting of defaults) {
          const existing = await this.knex('settings').where({ key: setting.key }).first();
          if (!existing) {
              await this.knex('settings').insert(setting);
          }
      }
  }

  async findAll(): Promise<any[]> {
    // Double check critical settings to ensure they appear in admin panel immediately
    const criticalKeys = ['payment_methods', 'support_email', 'bkash_number', 'nagad_number'];
    for (const key of criticalKeys) {
        const exists = await this.knex('settings').where({ key }).first();
        if (!exists) {
             const defaults: any = {
                 'payment_methods': 'bKash,Nagad,Visa,Mastercard,COD',
                 'support_email': 'support@prithibee.com',
                 'bkash_number': '01XXXXXXXXX',
                 'nagad_number': '01XXXXXXXXX'
             };
             const descriptions: any = {
                 'payment_methods': 'Available payment methods (comma separated)',
                 'support_email': 'Support email address',
                 'bkash_number': 'Personal bKash number for payments',
                 'nagad_number': 'Personal Nagad number for payments'
             };
             
             await this.knex('settings').insert({
                 key,
                 value: defaults[key],
                 description: descriptions[key]
             });
        }
    }

    return this.knex('settings').select('*');
  }

  async update(key: string, value: string): Promise<any> {
    // Check if setting exists
    const existing = await this.knex('settings').where({ key }).first();
    
    if (existing) {
        const [setting] = await this.knex('settings')
          .where({ key })
          .update({ value })
          .returning('*');
        return setting;
    } else {
        // Create if not exists
        const [setting] = await this.knex('settings')
          .insert({ key, value })
          .returning('*');
        return setting;
    }
  }

  async getValue(key: string): Promise<string | null> {
    const setting = await this.knex('settings').where({ key }).first();
    return setting ? setting.value : null;
  }
}
