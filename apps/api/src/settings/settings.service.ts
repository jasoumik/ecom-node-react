import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class SettingsService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

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
