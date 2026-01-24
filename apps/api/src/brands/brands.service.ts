import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async findAll(): Promise<any[]> {
    return this.knex('brands').select('*');
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
