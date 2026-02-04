import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';

@Injectable()
export class LabelsService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async findAll(includeInactive: boolean = false): Promise<any[]> {
    const query = this.knex('labels').select('*').orderBy('name', 'asc');
    if (!includeInactive) {
      query.where('is_active', true);
    }
    return query;
  }

  async findOne(id: string): Promise<any> {
    const label = await this.knex('labels').where({ id }).first();
    if (!label) {
      throw new NotFoundException(`Label with ID ${id} not found`);
    }
    return label;
  }

  async findBySlug(slug: string): Promise<any> {
    const label = await this.knex('labels').where({ slug, is_active: true }).first();
    if (!label) {
      throw new NotFoundException(`Label with slug ${slug} not found`);
    }
    return label;
  }

  async create(createLabelDto: CreateLabelDto): Promise<any> {
    const existing = await this.knex('labels').where({ slug: createLabelDto.slug }).first();
    if (existing) {
      throw new ConflictException(`Label with slug "${createLabelDto.slug}" already exists`);
    }

    const [label] = await this.knex('labels').insert(createLabelDto).returning('*');
    return label;
  }

  async update(id: string, updateLabelDto: UpdateLabelDto): Promise<any> {
    if (updateLabelDto.slug) {
      const existing = await this.knex('labels')
        .where({ slug: updateLabelDto.slug })
        .whereNot({ id })
        .first();
      if (existing) {
        throw new ConflictException(`Label with slug "${updateLabelDto.slug}" already exists`);
      }
    }

    const [label] = await this.knex('labels')
      .where({ id })
      .update(updateLabelDto)
      .returning('*');

    if (!label) {
      throw new NotFoundException(`Label with ID ${id} not found`);
    }
    return label;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.knex('labels').where({ id }).delete();
    if (!deleted) {
      throw new NotFoundException(`Label with ID ${id} not found`);
    }
  }

  async getProductsByLabel(labelId: string, page: number = 1, limit: number = 20): Promise<any> {
    const offset = (page - 1) * limit;

    const label = await this.findOne(labelId);

    const [countResult] = await this.knex('product_labels')
      .where('label_id', labelId)
      .count('* as total');
    const total = parseInt(countResult.total as string, 10);

    const products = await this.knex('products')
      .join('product_labels', 'products.id', 'product_labels.product_id')
      .where('product_labels.label_id', labelId)
      .where('products.is_active', true)
      .select('products.*')
      .limit(limit)
      .offset(offset)
      .orderBy('products.created_at', 'desc');

    return {
      label,
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async assignLabelsToProduct(productId: string, labelIds: string[]): Promise<void> {
    await this.knex.transaction(async (trx) => {
      await trx('product_labels').where({ product_id: productId }).delete();

      if (labelIds.length > 0) {
        const entries = labelIds.map((labelId) => ({
          product_id: productId,
          label_id: labelId,
        }));
        await trx('product_labels').insert(entries);
      }
    });
  }

  async getProductLabels(productId: string): Promise<any[]> {
    return this.knex('labels')
      .join('product_labels', 'labels.id', 'product_labels.label_id')
      .where('product_labels.product_id', productId)
      .select('labels.*');
  }
}

