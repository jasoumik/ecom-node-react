import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class MotherCategoriesService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async findAll(): Promise<any[]> {
    return this.knex('mother_categories').select('*').orderBy('sort_order', 'asc');
  }

  async findOne(id: string): Promise<any> {
    const category = await this.knex('mother_categories').where({ id }).first();
    if (!category) {
      throw new NotFoundException(`Mother Category with ID ${id} not found`);
    }
    return category;
  }

  async create(data: any): Promise<any> {
    const [category] = await this.knex('mother_categories').insert(data).returning('*');
    return category;
  }

  async update(id: string, data: any): Promise<any> {
    const [category] = await this.knex('mother_categories')
      .where({ id })
      .update(data)
      .returning('*');
    
    if (!category) {
      throw new NotFoundException(`Mother Category with ID ${id} not found`);
    }
    return category;
  }

  async remove(id: string): Promise<void> {
    const deletedCount = await this.knex('mother_categories').where({ id }).delete();
    if (deletedCount === 0) {
      throw new NotFoundException(`Mother Category with ID ${id} not found`);
    }
  }
}
