import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class DeliveryService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async findAll(): Promise<any[]> {
    return this.knex('delivery_charges').where({ is_active: true });
  }

  async findOne(id: string): Promise<any> {
    const charge = await this.knex('delivery_charges')
      .where({ id })
      .first();

    if (!charge) {
      throw new NotFoundException('Delivery charge not found');
    }

    return charge;
  }

  async create(data: any): Promise<any> {
    const [charge] = await this.knex('delivery_charges')
      .insert(data)
      .returning('*');
    return charge;
  }

  async update(id: string, data: any): Promise<any> {
    const updateData: any = {
      name: data.name,
      name_bn: data.name_bn,
      amount: data.amount,
    };

    if (typeof data.is_active === 'boolean') {
      updateData.is_active = data.is_active;
    }

    const [updated] = await this.knex('delivery_charges')
      .where({ id })
      .update(updateData)
      .returning('*');

    if (!updated) {
      throw new NotFoundException('Delivery charge not found');
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.knex('delivery_charges')
      .where({ id })
      .del();

    if (!deleted) {
      throw new NotFoundException('Delivery charge not found');
    }
  }
}
