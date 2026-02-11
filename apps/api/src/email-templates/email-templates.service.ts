import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class EmailTemplatesService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async findAll() {
    return this.knex('email_templates').select('*');
  }

  async findOne(id: string) {
    const template = await this.knex('email_templates').where({ id }).first();
    if (!template) {
      throw new NotFoundException(`Email template with ID ${id} not found`);
    }
    return template;
  }

  async findByName(name: string) {
    const template = await this.knex('email_templates').where({ name }).first();
    return template;
  }

  async update(id: string, updateData: any) {
    const [updated] = await this.knex('email_templates')
      .where({ id })
      .update(updateData)
      .returning('*');
    
    if (!updated) {
      throw new NotFoundException(`Email template with ID ${id} not found`);
    }
    return updated;
  }
}
