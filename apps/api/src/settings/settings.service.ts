import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async onModuleInit() {
      try {
          // Fix for "value too long" error: Change value column to TEXT
          await this.knex.raw('ALTER TABLE settings ALTER COLUMN value TYPE TEXT');
          console.log('Successfully altered settings.value to TEXT');
      } catch (e) {
          // It might fail if table doesn't exist or other reasons, but usually safe to ignore if it's already TEXT
          // console.error('Migration note: Failed to alter settings table (might be already correct)', e);
      }
  }

  async findAll(): Promise<any[]> {
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
