import { Injectable, Inject, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { SettingsService } from '../settings/settings.service';
import { RequestsService } from '../requests/requests.service';
import { slugify } from '../utils/slugify';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly settingsService: SettingsService,
    private readonly requestsService: RequestsService
  ) {}

  async findAll(
      page: number = 1, 
      limit: number = 10, 
      categoryId?: string, 
      search?: string, 
      brandId?: string, 
      ageId?: string,
      sort?: string,
      minPrice?: number,
      maxPrice?: number
  ): Promise<any> {
    const offset = (page - 1) * limit;
    
    const baseQuery = this.knex('products');
    
    if (categoryId) {
      let catId = categoryId;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
      if (!isUuid) {
          const category = await this.knex('categories').where({ slug: categoryId }).select('id').first();
          if (category) catId = category.id;
      }

      // Find subcategories
      const subCategories = await this.knex('categories').where({ parent_id: catId }).select('id');
      const categoryIds = [catId, ...subCategories.map(c => c.id)];
      
      baseQuery.whereIn('category_id', categoryIds);
    }

    if (brandId) {
      let bId = brandId;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(brandId);
      if (!isUuid) {
          const brand = await this.knex('brands').where({ slug: brandId }).select('id').first();
          if (brand) bId = brand.id;
      }
      baseQuery.where({ brand_id: bId });
    }

    if (ageId) {
        let aId = ageId;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ageId);
        if (!isUuid) {
            const ageGroup = await this.knex('age_groups').where({ slug: ageId }).select('id').first();
            if (ageGroup) aId = ageGroup.id;
        }
        baseQuery.where('age_groups', 'like', `%${aId}%`);
    }

    if (search) {
        baseQuery.where('name', 'ilike', `%${search}%`);
    }
    
    // Price Filter
    if (minPrice !== undefined) {
        baseQuery.whereRaw('CAST(price AS DECIMAL) >= ?', [minPrice]);
    }
    if (maxPrice !== undefined) {
        baseQuery.whereRaw('CAST(price AS DECIMAL) <= ?', [maxPrice]);
    }

    const [countResult] = await baseQuery.clone().count('* as total');
    const total = parseInt(countResult.total as string, 10);

    let query = baseQuery.clone().select('*').limit(limit).offset(offset);
    
    // Sorting
    switch (sort) {
        case 'price_asc':
            query.orderByRaw('CAST(price AS DECIMAL) ASC');
            break;
        case 'price_desc':
            query.orderByRaw('CAST(price AS DECIMAL) DESC');
            break;
        case 'popularity':
            // For now, fallback to newest as we don't have a popularity metric column
            // Ideally this would be a join with orders or reviews
            query.orderBy('created_at', 'desc');
            break;
        case 'newest':
        default:
            query.orderBy('created_at', 'desc');
            break;
    }

    const products = await query;

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

  async findOne(idOrSlug: string): Promise<any> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const query = this.knex('products')
        .leftJoin('countries', 'products.country_id', 'countries.id')
        .leftJoin('categories', 'products.category_id', 'categories.id')
        .select(
            'products.*',
            'countries.name as country_name',
            'countries.name_bn as country_name_bn',
            'countries.flag as country_flag',
            'categories.name as category_name',
            'categories.name_bn as category_name_bn'
        );

    if (isUuid) {
        query.where('products.id', idOrSlug);
    } else {
        query.where('products.slug', idOrSlug);
    }

    const product = await query.first();

    if (!product) {
      throw new NotFoundException(`Product not found`);
    }
    
    const inventoryMethod = await this.settingsService.getValue('inventory_method') || 'FIFO';
    const orderBy = inventoryMethod === 'LIFO' ? 'desc' : 'asc';

    const batches = await this.knex('product_batches')
        .where({ product_id: product.id })
        .where('remaining_quantity', '>', 0)
        .orderBy('purchase_date', orderBy);

    const variants = await this.knex('product_variants').where({ product_id: product.id });
        
    return { ...product, batches, variants, inventoryMethod };
  }

  async create(createProductDto: CreateProductDto): Promise<any> {
    const { images, variants, age_groups, ...productData } = createProductDto;
    
    let slug = createProductDto.slug;
    if (!slug) {
        slug = slugify(createProductDto.name);
    }
    
    // Ensure unique slug
    let counter = 1;
    let originalSlug = slug;
    while (await this.knex('products').where({ slug }).first()) {
        slug = `${originalSlug}-${counter}`;
        counter++;
    }

    // Ensure category_id is null if empty string
    if (productData.category_id === '') {
        // @ts-ignore
        productData.category_id = null;
    }

    try {
        return await this.knex.transaction(async (trx) => {
            const [product] = await trx('products').insert({
                ...productData,
                slug,
                images: JSON.stringify(images),
                age_groups: age_groups ? age_groups.join(',') : null, // Store as comma-separated string
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
    } catch (error) {
        throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<any> {
    const { 
        images, 
        variants,
        age_groups,
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

    if (age_groups) {
        dataToUpdate.age_groups = Array.isArray(age_groups) ? age_groups.join(',') : age_groups;
    }
    
    if (variants) {
        dataToUpdate.has_variants = variants.length > 0;
    }

    if (dataToUpdate.slug) {
        let slug = dataToUpdate.slug;
        let counter = 1;
        let originalSlug = slug;
        while (await this.knex('products').where({ slug }).whereNot({ id }).first()) {
            slug = `${originalSlug}-${counter}`;
            counter++;
        }
        dataToUpdate.slug = slug;
    }
    
    try {
        return await this.knex.transaction(async (trx) => {
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
    } catch (error) {
        if (error instanceof NotFoundException) throw error;
        throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: string): Promise<void> {
    const deletedCount = await this.knex('products').where({ id }).delete();
    if (deletedCount === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async addBatch(productId: string, batchData: any): Promise<any> {
    // Sanitize expiry_date: if empty string, set to null
    if (batchData.expiry_date === '') {
        batchData.expiry_date = null;
    }

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

  async adjustStock(dto: AdjustStockDto): Promise<any> {
      const { productId, variantId, quantity, type, reason, unitPrice, orderId } = dto;
      
      return this.knex.transaction(async (trx) => {
          const product = await trx('products').where({ id: productId }).first();
          if (!product) throw new NotFoundException('Product not found');

          let quantityChange = quantity;
          const isReduction = ['wastage', 'broken', 'offline_sale', 'correction_remove'].includes(type);
          
          if (isReduction) {
              quantityChange = -quantity;
          }

          // Handle Batches (FIFO for reduction, New Batch for addition)
          if (isReduction) {
              // FIFO Logic: Find oldest batches with stock
              const batches = await trx('product_batches')
                  .where({ product_id: productId })
                  .where('remaining_quantity', '>', 0)
                  .orderBy('purchase_date', 'asc');
              
              let remainingToDeduct = quantity;
              
              for (const batch of batches) {
                  if (remainingToDeduct <= 0) break;
                  
                  const deduct = Math.min(batch.remaining_quantity, remainingToDeduct);
                  await trx('product_batches')
                      .where({ id: batch.id })
                      .decrement('remaining_quantity', deduct);
                      
                  remainingToDeduct -= deduct;
              }
          } else if (type === 'correction_add' || type === 'return_restock') {
              // Create a new batch for the added stock if price is provided
              // Or if it's a return, maybe we should try to find the original batch? 
              // For simplicity, we create a new "Adjustment" batch or "Return" batch
              if (unitPrice) {
                  await trx('product_batches').insert({
                      product_id: productId,
                      variant_id: variantId,
                      batch_number: type === 'return_restock' ? `RET-${Date.now()}` : `ADJ-${Date.now()}`,
                      purchase_price: unitPrice, // Use provided price as cost
                      selling_price: product.price, // Keep current selling price
                      quantity: quantity,
                      remaining_quantity: quantity,
                      purchase_date: new Date(),
                      is_active: true
                  });
              }
          }

          if (variantId) {
              const variant = await trx('product_variants').where({ id: variantId }).first();
              if (!variant) throw new NotFoundException('Variant not found');
              
              await trx('product_variants').where({ id: variantId }).increment('stock', quantityChange);
          }
          
          await trx('products').where({ id: productId }).increment('stock', quantityChange);
          
          await trx('stock_movements').insert({
              product_id: productId,
              variant_id: variantId,
              quantity_change: quantityChange,
              type: type,
              reason: reason || `Manual Adjustment: ${type}`,
              order_id: orderId // Link to order if return
          });
          
          return { success: true };
      });
  }
}
