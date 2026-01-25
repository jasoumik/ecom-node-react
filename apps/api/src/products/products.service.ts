import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly settingsService: SettingsService
  ) {}

  async findAll(page: number = 1, limit: number = 10, categoryId?: string): Promise<any> {
    const offset = (page - 1) * limit;
    
    const countQuery = this.knex('products');
    if (categoryId) {
      countQuery.where({ category_id: categoryId });
    }
    const [countResult] = await countQuery.count('* as total');
    const total = parseInt(countResult.total as string, 10);

    const dataQuery = this.knex('products').select('*');
    if (categoryId) {
      dataQuery.where({ category_id: categoryId });
    }
    const data = await dataQuery.limit(limit).offset(offset).orderBy('created_at', 'desc');

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
    const product = await this.knex('products').where({ id }).first();
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

        return batch[0];
    });
  }

  async getAllBatches(page: number = 1, limit: number = 20): Promise<any> {
    const offset = (page - 1) * limit;
    
    const [countResult] = await this.knex('product_batches').count('* as total');
    const total = parseInt(countResult.total as string, 10);

    const data = await this.knex('product_batches')
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
      
      const query = this.knex('stock_movements')
        .join('products', 'stock_movements.product_id', 'products.id')
        .select(
            'stock_movements.*',
            'products.name as product_name'
        );
        
      if (productId) {
          query.where('stock_movements.product_id', productId);
      }
      
      const [countResult] = await query.clone().count('* as total');
      const total = parseInt(countResult.total as string, 10);
      
      const data = await query
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
