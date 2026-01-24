import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async findAll(): Promise<any[]> {
    return this.knex('banners').select('*').orderBy('order', 'asc');
  }

  async findOne(id: string): Promise<any> {
    const banner = await this.knex('banners').where({ id }).first();
    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }
    return banner;
  }

  async create(createBannerDto: CreateBannerDto): Promise<any> {
    const [banner] = await this.knex('banners').insert(createBannerDto).returning('*');
    return banner;
  }

  async update(id: string, updateBannerDto: UpdateBannerDto): Promise<any> {
    const [banner] = await this.knex('banners')
      .where({ id })
      .update(updateBannerDto)
      .returning('*');
    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }
    return banner;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.knex('banners').where({ id }).delete();
    if (!deleted) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }
  }
}
