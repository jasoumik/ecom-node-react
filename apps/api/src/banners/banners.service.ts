import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async findAll(includeInactive: boolean = false): Promise<any[]> {
    let query = this.knex('banners')
      .leftJoin('labels', 'banners.label_id', 'labels.id')
      .select(
        'banners.*',
        'labels.name as label_name',
        'labels.slug as label_slug',
        'labels.color as label_color'
      )
      .orderBy('banners.order', 'asc');

    if (!includeInactive) {
      const today = new Date().toISOString().split('T')[0];
      query = query
        .where('banners.is_active', true)
        .where(function() {
          this.whereNull('banners.starts_at').orWhere('banners.starts_at', '<=', today);
        })
        .where(function() {
          this.where('banners.no_expiry', true)
            .orWhereNull('banners.expires_at')
            .orWhere('banners.expires_at', '>=', today);
        });
    }

    return query;
  }

  async findByPosition(position: string): Promise<any[]> {
    const today = new Date().toISOString().split('T')[0];

    return this.knex('banners')
      .leftJoin('labels', 'banners.label_id', 'labels.id')
      .select(
        'banners.*',
        'labels.name as label_name',
        'labels.slug as label_slug',
        'labels.color as label_color'
      )
      .where('banners.position', position)
      .where('banners.is_active', true)
      .where(function() {
        this.whereNull('banners.starts_at').orWhere('banners.starts_at', '<=', today);
      })
      .where(function() {
        this.where('banners.no_expiry', true)
          .orWhereNull('banners.expires_at')
          .orWhere('banners.expires_at', '>=', today);
      })
      .orderBy('banners.order', 'asc');
  }

  async findByLabel(labelId: string): Promise<any[]> {
    const today = new Date().toISOString().split('T')[0];

    return this.knex('banners')
      .leftJoin('labels', 'banners.label_id', 'labels.id')
      .select(
        'banners.*',
        'labels.name as label_name',
        'labels.slug as label_slug',
        'labels.color as label_color'
      )
      .where('banners.label_id', labelId)
      .where('banners.is_active', true)
      .where(function() {
        this.whereNull('banners.starts_at').orWhere('banners.starts_at', '<=', today);
      })
      .where(function() {
        this.where('banners.no_expiry', true)
          .orWhereNull('banners.expires_at')
          .orWhere('banners.expires_at', '>=', today);
      })
      .orderBy('banners.order', 'asc');
  }

  async findOne(id: string): Promise<any> {
    const banner = await this.knex('banners')
      .leftJoin('labels', 'banners.label_id', 'labels.id')
      .select(
        'banners.*',
        'labels.name as label_name',
        'labels.slug as label_slug',
        'labels.color as label_color'
      )
      .where('banners.id', id)
      .first();
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
    // Filter out fields that are not columns in the banners table
    // We are NOT ignoring the label_id, just the joined fields that are read-only
    const {
        // @ts-ignore
        label_name,
        // @ts-ignore
        label_slug,
        // @ts-ignore
        label_color,
        // @ts-ignore
        created_at,
        // @ts-ignore
        updated_at,
        // @ts-ignore
        id: _id,
        ...dataToUpdate
    } = updateBannerDto as any;

    const [banner] = await this.knex('banners')
      .where({ id })
      .update(dataToUpdate)
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
