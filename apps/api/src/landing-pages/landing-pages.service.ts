import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class LandingPagesService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async create(data: any) {
    const existing = await this.knex('landing_pages').where({ slug: data.slug }).first();
    if (existing) {
        throw new BadRequestException('Slug already exists');
    }
    const [landingPage] = await this.knex('landing_pages').insert(data).returning('*');
    return landingPage;
  }

  async findAll() {
    return this.knex('landing_pages')
        .join('products', 'landing_pages.product_id', 'products.id')
        .select('landing_pages.*', 'products.name as product_name')
        .orderBy('landing_pages.created_at', 'desc');
  }

  async findOne(id: string) {
    const landingPage = await this.knex('landing_pages').where({ id }).first();
    if (!landingPage) throw new NotFoundException('Landing page not found');
    return landingPage;
  }

  async findBySlug(slug: string) {
    const landingPage = await this.knex('landing_pages').where({ slug, is_active: true }).first();
    if (!landingPage) throw new NotFoundException('Landing page not found');
    return landingPage;
  }

  async update(id: string, data: any) {
    const [updated] = await this.knex('landing_pages').where({ id }).update(data).returning('*');
    return updated;
  }

  async remove(id: string) {
    await this.knex('landing_pages').where({ id }).delete();
  }
}
