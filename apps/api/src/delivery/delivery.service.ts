import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class DeliveryService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async findAll(): Promise<any[]> {
    return this.knex('delivery_charges').where({ is_active: true });
  }

  async create(data: any): Promise<any> {
    const [charge] = await this.knex('delivery_charges').insert(data).returning('*');
    return charge;
  }
}
