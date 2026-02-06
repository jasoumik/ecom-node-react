import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateBundleDto } from './dto/create-bundle.dto';
import { UpdateBundleDto } from './dto/update-bundle.dto';

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

  async findOne(id: string) {
    const bundle = await this.knex('bundles').where({ id }).first();
    if (!bundle) {
      throw new NotFoundException(`Bundle with ID ${id} not found`);
    }
    
    const items = await this.knex('bundle_items')
        .join('products', 'bundle_items.product_id', 'products.id')
        .leftJoin('product_variants', 'bundle_items.variant_id', 'product_variants.id')
        .where({ bundle_id: id })
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
    
    return this.knex.transaction(async (trx) => {
        const [bundle] = await trx('bundles').insert(bundleData).returning('*');
        
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
    
    return this.knex.transaction(async (trx) => {
        const [bundle] = await trx('bundles')
            .where({ id })
            .update(bundleData)
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
