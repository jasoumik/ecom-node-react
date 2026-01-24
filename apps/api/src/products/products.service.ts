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
    
    // Base query for counting
    const countQuery = this.knex('products');
    if (categoryId) {
      countQuery.where({ category_id: categoryId });
    }
    const [countResult] = await countQuery.count('* as total');
    const total = parseInt(countResult.total as string, 10);

    // Base query for data
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
    
    // Fetch batches based on inventory method setting
    const inventoryMethod = await this.settingsService.getValue('inventory_method') || 'FIFO';
    const orderBy = inventoryMethod === 'LIFO' ? 'desc' : 'asc'; // LIFO: newest first, FIFO: oldest first

    const batches = await this.knex('product_batches')
        .where({ product_id: id })
        .where('remaining_quantity', '>', 0) // Only show active batches
        .orderBy('purchase_date', orderBy);
        
    return { ...product, batches, inventoryMethod };
  }

  async create(createProductDto: CreateProductDto): Promise<any> {
    const { images, ...productData } = createProductDto;
    
    const [product] = await this.knex('products').insert({
        ...productData,
        images: JSON.stringify(images)
    }).returning('*');
    
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<any> {
    const { images, ...updateData } = updateProductDto;
    const dataToUpdate: any = { ...updateData };
    
    if (images) {
        dataToUpdate.images = JSON.stringify(images);
    }
    
    const [product] = await this.knex('products')
      .where({ id })
      .update(dataToUpdate)
      .returning('*');
      
    if (!product) {
       throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async remove(id: string): Promise<void> {
    const deletedCount = await this.knex('products').where({ id }).delete();
    if (deletedCount === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async addBatch(productId: string, batchData: any): Promise<any> {
    const batch = await this.knex('product_batches').insert({
      product_id: productId,
      ...batchData,
      remaining_quantity: batchData.quantity
    }).returning('*');

    // Update total stock
    await this.knex('products').where({ id: productId }).increment('stock', batchData.quantity);
    
    // Update product price to latest batch selling price (optional, but common)
    await this.knex('products').where({ id: productId }).update({ price: batchData.selling_price });

    return batch[0];
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
      // Get batch to decrease stock
      const batch = await this.knex('product_batches').where({ id }).first();
      if (batch) {
          await this.knex('products').where({ id: batch.product_id }).decrement('stock', batch.remaining_quantity);
          await this.knex('product_batches').where({ id }).delete();
      } else {
          throw new NotFoundException(`Batch with ID ${id} not found`);
      }
  }
}
