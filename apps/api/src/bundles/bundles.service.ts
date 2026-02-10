import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateBundleDto } from './dto/create-bundle.dto';
import { UpdateBundleDto } from './dto/update-bundle.dto';
import { slugify } from '../utils/slugify';

@Injectable()
export class BundlesService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async findAll(publicOnly: boolean = false) {
    let query = this.knex('bundles').select('*');
    
    if (publicOnly) {
        query.where('is_active', true);
    }
    
    const bundles = await query.orderBy('created_at', 'desc');
    
    // Fetch items for each bundle
    const bundleIds = bundles.map(b => b.id);
    const items = await this.knex('bundle_items')
        .join('products', 'bundle_items.product_id', 'products.id')
        .leftJoin('product_variants', 'bundle_items.variant_id', 'product_variants.id')
        .whereIn('bundle_items.bundle_id', bundleIds)
        .select(
            'bundle_items.*',
            'products.name as product_name',
            'products.images as product_images',
            'product_variants.size as variant_size',
            'product_variants.color as variant_color',
            'product_variants.weight as variant_weight'
        );
        
    const itemsMap = items.reduce((acc, item) => {
        if (!acc[item.bundle_id]) acc[item.bundle_id] = [];
        acc[item.bundle_id].push(item);
        return acc;
    }, {});
    
    return bundles.map(b => ({
        ...b,
        items: itemsMap[b.id] || []
    }));
  }

  async findOne(idOrSlug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    
    const query = this.knex('bundles');
    if (isUuid) {
        query.where('id', idOrSlug);
    } else {
        query.where('slug', idOrSlug);
    }
    
    const bundle = await query.first();
    if (!bundle) {
      throw new NotFoundException(`Bundle not found`);
    }
    
    const items = await this.knex('bundle_items')
        .join('products', 'bundle_items.product_id', 'products.id')
        .leftJoin('product_variants', 'bundle_items.variant_id', 'product_variants.id')
        .where({ bundle_id: bundle.id })
        .select(
            'bundle_items.*',
            'products.name as product_name',
            'products.price as product_price',
            'products.images as product_images',
            'product_variants.size as variant_size',
            'product_variants.color as variant_color',
            'product_variants.weight as variant_weight',
            'product_variants.price as variant_price'
        );
        
    return { ...bundle, items };
  }

  async create(createBundleDto: CreateBundleDto) {
    const { items, ...bundleData } = createBundleDto;
    
    let slug = createBundleDto.slug;
    if (!slug) {
        slug = slugify(createBundleDto.title);
    }
    
    let counter = 1;
    let originalSlug = slug;
    while (await this.knex('bundles').where({ slug }).first()) {
        slug = `${originalSlug}-${counter}`;
        counter++;
    }

    return this.knex.transaction(async (trx) => {
        const [bundle] = await trx('bundles').insert({
            ...bundleData,
            slug
        }).returning('*');
        
        if (items && items.length > 0) {
            const itemsToInsert = items.map(item => ({
                bundle_id: bundle.id,
                product_id: item.product_id,
                variant_id: item.variant_id || null,
                quantity: item.quantity
            }));
            await trx('bundle_items').insert(itemsToInsert);
        }
        
        return bundle;
    });
  }

  async update(id: string, updateBundleDto: UpdateBundleDto) {
    const { items, ...bundleData } = updateBundleDto;
    const dataToUpdate: any = { ...bundleData };
    
    if (dataToUpdate.slug) {
        let slug = dataToUpdate.slug;
        let counter = 1;
        let originalSlug = slug;
        while (await this.knex('bundles').where({ slug }).whereNot({ id }).first()) {
            slug = `${originalSlug}-${counter}`;
            counter++;
        }
        dataToUpdate.slug = slug;
    }
    
    return this.knex.transaction(async (trx) => {
        const [bundle] = await trx('bundles')
            .where({ id })
            .update(dataToUpdate)
            .returning('*');
            
        if (!bundle) {
            throw new NotFoundException(`Bundle with ID ${id} not found`);
        }
        
        if (items) {
            await trx('bundle_items').where({ bundle_id: id }).delete();
            if (items.length > 0) {
                const itemsToInsert = items.map(item => ({
                    bundle_id: id,
                    product_id: item.product_id,
                    variant_id: item.variant_id || null,
                    quantity: item.quantity
                }));
                await trx('bundle_items').insert(itemsToInsert);
            }
        }
        
        return bundle;
    });
  }

  async remove(id: string) {
    const deletedCount = await this.knex('bundles').where({ id }).delete();
    if (deletedCount === 0) {
      throw new NotFoundException(`Bundle with ID ${id} not found`);
    }
  }
}
