import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { slugify } from '../utils/slugify';

@Injectable()
export class BrandsService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async findAll(publicOnly: boolean = false): Promise<any[]> {
    const query = this.knex('brands').select('*').orderBy('created_at', 'desc');
    
    if (publicOnly) {
        // Filter brands that have products with stock > 0
        query.whereIn('id', function() {
            this.select('brand_id').from('products').where('stock', '>', 0).whereNotNull('brand_id');
        });
        query.where('is_active', true);
    }
    
    return query;
  }

  async findOne(idOrSlug: string): Promise<any> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    
    const query = this.knex('brands');
    if (isUuid) {
        query.where('id', idOrSlug);
    } else {
        query.where('slug', idOrSlug);
    }
    
    const brand = await query.first();
    if (!brand) {
      throw new NotFoundException(`Brand not found`);
    }
    return brand;
  }

  async create(createBrandDto: CreateBrandDto): Promise<any> {
    let slug = createBrandDto.slug;
    if (!slug) {
        slug = slugify(createBrandDto.name);
    }
    
    let counter = 1;
    let originalSlug = slug;
    while (await this.knex('brands').where({ slug }).first()) {
        slug = `${originalSlug}-${counter}`;
        counter++;
    }

    const [brand] = await this.knex('brands').insert({
        ...createBrandDto,
        slug
    }).returning('*');
    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<any> {
    const dataToUpdate = { ...updateBrandDto };
    
    if (dataToUpdate.slug) {
        let slug = dataToUpdate.slug;
        let counter = 1;
        let originalSlug = slug;
        while (await this.knex('brands').where({ slug }).whereNot({ id }).first()) {
            slug = `${originalSlug}-${counter}`;
            counter++;
        }
        dataToUpdate.slug = slug;
    }

    const [brand] = await this.knex('brands')
      .where({ id })
      .update(dataToUpdate)
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
