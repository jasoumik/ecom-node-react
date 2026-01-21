import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async findAll(): Promise<any[]> {
    return this.knex('products').select('*');
  }

  async findByCategory(categoryId: string): Promise<any[]> {
    return this.knex('products').where({ category_id: categoryId }).select('*');
  }

  async findOne(id: string): Promise<any> {
    const product = await this.knex('products').where({ id }).first();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<any> {
    const [product] = await this.knex('products').insert({
        ...createProductDto,
        images: JSON.stringify(createProductDto.images)
    }).returning('*');
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<any> {
    const updateData: any = { ...updateProductDto };
    if (updateData.images) {
        updateData.images = JSON.stringify(updateData.images);
    }
    
    const [product] = await this.knex('products')
      .where({ id })
      .update(updateData)
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
}
