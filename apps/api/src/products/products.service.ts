import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SettingsService } from '../settings/settings.service';
import { RequestsService } from '../requests/requests.service';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly settingsService: SettingsService,
    private readonly requestsService: RequestsService
  ) {}

  async findAll(page: number = 1, limit: number = 10, categoryId?: string, search?: string, brandId?: string): Promise<any> {
    const offset = (page - 1) * limit;
    
    const baseQuery = this.knex('products');
    if (categoryId) {
      baseQuery.where({ category_id: categoryId });
    }
    if (brandId) {
      baseQuery.where({ brand_id: brandId });
    }
    if (search) {
        baseQuery.where('name', 'ilike', `%${search}%`);
    }

    const [countResult] = await baseQuery.clone().count('* as total');
    const total = parseInt(countResult.total as string, 10);

    const products = await baseQuery.clone().select('*').limit(limit).offset(offset).orderBy('created_at', 'desc');

    const productIds = products.map(p => p.id);

    // Fetch ratings
    const ratings = await this.knex('reviews')
        .whereIn('product_id', productIds)
        .where('status', 'approved')
        .select('product_id')
        .count('* as count')
        .avg('rating as average')
        .groupBy('product_id');

    const ratingsMap = ratings.reduce((acc, r) => {
        acc[r.product_id] = {
            count: parseInt(r.count as string, 10),
            average: parseFloat(r.average as string).toFixed(1)
        };
        return acc;
    }, {});

    // Fetch price ranges from variants
    const variants = await this.knex('product_variants')
        .whereIn('product_id', productIds)
        .select('product_id', 'price');

    const priceMap = variants.reduce((acc, v) => {
        if (!acc[v.product_id]) acc[v.product_id] = [];
        if (v.price) acc[v.product_id].push(parseFloat(v.price));
        return acc;
    }, {});

    const data = products.map(p => {
        const variantPrices = priceMap[p.id] || [];
        const basePrice = parseFloat(p.price);
        const allPrices = [basePrice, ...variantPrices].filter(p => !isNaN(p));
        
        const minPrice = Math.min(...allPrices);
        const maxPrice = Math.max(...allPrices);

        return {
            ...p,
            reviewCount: ratingsMap[p.id]?.count || 0,
            rating: ratingsMap[p.id]?.average || 0,
            minPrice,
            maxPrice,
            hasMultiplePrices: minPrice !== maxPrice
        };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByCategory(categoryId: string): Promise<any[]> {
    return this.knex('products').where({ category_id: categoryId }).select('*');
  }

  async findOne(id: string): Promise<any> {
    const product = await this.knex('products')
        .leftJoin('countries', 'products.country_id', 'countries.id')
        .leftJoin('categories', 'products.category_id', 'categories.id')
        .select(
            'products.*',
            'countries.name as country_name',
            'countries.name_bn as country_name_bn',
            'countries.flag as country_flag',
            'categories.name as category_name',
            'categories.name_bn as category_name_bn'
        )
        .where('products.id', id)
        .first();

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    const inventoryMethod = await this.settingsService.getValue('inventory_method') || 'FIFO';
    const orderBy = inventoryMethod === 'LIFO' ? 'desc' : 'asc';

    const batches = await this.knex('product_batches')
        .where({ product_id: id })
        .where('remaining_quantity', '>', 0)
        .orderBy('purchase_date', orderBy);

    const variants = await this.knex('product_variants').where({ product_id: id });
        
    return { ...product, batches, variants, inventoryMethod };
  }

  async create(createProductDto: CreateProductDto): Promise<any> {
    const { images, variants, ...productData } = createProductDto;
    
    return this.knex.transaction(async (trx) => {
        const [product] = await trx('products').insert({
            ...productData,
            images: JSON.stringify(images),
            has_variants: variants && variants.length > 0
        }).returning('*');

        if (variants && variants.length > 0) {
            const variantsToInsert = variants.map(v => ({
                product_id: product.id,
                size: v.size || null,
                color: v.color || null,
                material: v.material || null,
                weight: v.weight || null,
                price: v.price ? parseFloat(v.price.toString()) : null,
                stock: parseInt(v.stock.toString()) || 0,
                sku: v.sku || null
            }));
            await trx('product_variants').insert(variantsToInsert);
            
            const totalStock = variants.reduce((sum, v) => sum + (parseInt(v.stock.toString()) || 0), 0);
            await trx('products').where({ id: product.id }).update({ stock: totalStock });
            product.stock = totalStock;
        }
        
        if (product.stock > 0) {
             await trx('stock_movements').insert({
                product_id: product.id,
                quantity_change: product.stock,
                type: 'initial_stock',
                reason: 'Product Created'
            });
        }
        
        return product;
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<any> {
    const { 
        images, 
        variants,
        // @ts-ignore
        batches, 
        // @ts-ignore
        inventoryMethod, 
        // @ts-ignore
        created_at, 
        // @ts-ignore
        updated_at, 
        // @ts-ignore
        id: _id,
        // @ts-ignore
        country_name,
        // @ts-ignore
        country_name_bn,
        // @ts-ignore
        country_flag,
        // @ts-ignore
        category_name,
        // @ts-ignore
        category_name_bn,
        // @ts-ignore
        reviewCount,
        // @ts-ignore
        rating,
        // @ts-ignore
        minPrice,
        // @ts-ignore
        maxPrice,
        // @ts-ignore
        hasMultiplePrices,
        ...updateData 
    } = updateProductDto as any;

    const dataToUpdate: any = { ...updateData };
    
    if (images) {
        dataToUpdate.images = JSON.stringify(images);
    }
    
    if (variants) {
        dataToUpdate.has_variants = variants.length > 0;
    }
    
    return this.knex.transaction(async (trx) => {
        const [product] = await trx('products')
          .where({ id })
          .update(dataToUpdate)
          .returning('*');
          
        if (!product) {
           throw new NotFoundException(`Product with ID ${id} not found`);
        }

        if (variants) {
            await trx('product_variants').where({ product_id: id }).delete();
            
            if (variants.length > 0) {
                const variantsToInsert = variants.map((v: any) => ({
                    product_id: id,
                    size: v.size || null,
                    color: v.color || null,
                    material: v.material || null,
                    weight: v.weight || null,
                    price: v.price ? parseFloat(v.price.toString()) : null,
                    stock: parseInt(v.stock.toString()) || 0,
                    sku: v.sku || null
                }));
                await trx('product_variants').insert(variantsToInsert);
                
                const totalStock = variants.reduce((sum: number, v: any) => sum + (parseInt(v.stock.toString()) || 0), 0);
                
                const oldStock = product.stock;
                const diff = totalStock - oldStock;
                
                await trx('products').where({ id }).update({ stock: totalStock });
                product.stock = totalStock;

                if (diff !== 0) {
                    await trx('stock_movements').insert({
                        product_id: id,
                        quantity_change: diff,
                        type: 'manual_adjustment',
                        reason: 'Variant Update'
                    });
                }
            }
        }
        
        // Check for stock requests if stock increased
        if (product.stock > 0) {
            // This is async, don't await to block response
            this.requestsService.notifyStockAvailable(id);
        }
        
        return product;
    });
  }

  async remove(id: string): Promise<void> {
    const deletedCount = await this.knex('products').where({ id }).delete();
    if (deletedCount === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async addBatch(productId: string, batchData: any): Promise<any> {
    return this.knex.transaction(async (trx) => {
        const batch = await trx('product_batches').insert({
        product_id: productId,
        ...batchData,
        remaining_quantity: batchData.quantity
        }).returning('*');

        await trx('products').where({ id: productId }).increment('stock', batchData.quantity);
        await trx('products').where({ id: productId }).update({ price: batchData.selling_price });

        await trx('stock_movements').insert({
            product_id: productId,
            quantity_change: batchData.quantity,
            type: 'batch_purchase',
            reason: `Batch #${batchData.batch_number}`
        });
        
        // Notify stock requests
        this.requestsService.notifyStockAvailable(productId);

        return batch[0];
    });
  }

  async getAllBatches(page: number = 1, limit: number = 20): Promise<any> {
    const offset = (page - 1) * limit;
    
    const baseQuery = this.knex('product_batches');
    
    const [countResult] = await baseQuery.clone().count('* as total');
    const total = parseInt(countResult.total as string, 10);

    const data = await baseQuery
        .join('products', 'product_batches.product_id', 'products.id')
        .select(
            'product_batches.*',
            'products.name as product_name',
            'products.sku as product_sku'
        )
        .limit(limit)
        .offset(offset)
        .orderBy('product_batches.created_at', 'desc');

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteBatch(id: string): Promise<void> {
      const batch = await this.knex('product_batches').where({ id }).first();
      if (batch) {
          await this.knex('products').where({ id: batch.product_id }).decrement('stock', batch.remaining_quantity);
          await this.knex('product_batches').where({ id }).delete();
          
          await this.knex('stock_movements').insert({
            product_id: batch.product_id,
            quantity_change: -batch.remaining_quantity,
            type: 'manual_adjustment',
            reason: `Batch #${batch.batch_number} Deleted`
        });
      } else {
          throw new NotFoundException(`Batch with ID ${id} not found`);
      }
  }

  async getStockMovements(page: number = 1, limit: number = 20, productId?: string): Promise<any> {
      const offset = (page - 1) * limit;
      
      const baseQuery = this.knex('stock_movements');
        
      if (productId) {
          baseQuery.where('stock_movements.product_id', productId);
      }
      
      const [countResult] = await baseQuery.clone().count('* as total');
      const total = parseInt(countResult.total as string, 10);
      
      const data = await baseQuery
        .join('products', 'stock_movements.product_id', 'products.id')
        .select(
            'stock_movements.*',
            'products.name as product_name'
        )
        .limit(limit)
        .offset(offset)
        .orderBy('stock_movements.created_at', 'desc');
        
      return {
          data,
          meta: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
          }
      };
  }
}
