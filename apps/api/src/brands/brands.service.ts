import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async findAll(publicOnly: boolean = false): Promise<any[]> {
    const query = this.knex('brands').select('*');
    
    if (publicOnly) {
        // Filter brands that have products with stock > 0
        query.whereIn('id', function() {
            this.select('brand_id').from('products').where('stock', '>', 0).whereNotNull('brand_id');
        });
        query.where('is_active', true);
    }
    
    return query;
  }

  async findOne(id: string): Promise<any> {
    const brand = await this.knex('brands').where({ id }).first();
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    return brand;
  }

  async create(createBrandDto: CreateBrandDto): Promise<any> {
    const [brand] = await this.knex('brands').insert(createBrandDto).returning('*');
    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<any> {
    const [brand] = await this.knex('brands')
      .where({ id })
      .update(updateBrandDto)
      .returning('*');
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    return brand;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.knex('brands').where({ id }).delete();
    if (!deleted) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
  }
}
