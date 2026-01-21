import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async findAll(): Promise<any[]> {
    const categories = await this.knex('categories').select('*');
    return this.buildTree(categories);
  }

  async findOne(id: string): Promise<any> {
    const category = await this.knex('categories').where({ id }).first();
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    // Fetch children
    const children = await this.knex('categories').where({ parent_id: id });
    return { ...category, children: this.buildTree(children) };
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<any> {
    const [category] = await this.knex('categories').insert(createCategoryDto).returning('*');
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<any> {
    const [category] = await this.knex('categories')
      .where({ id })
      .update(updateCategoryDto)
      .returning('*');
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.knex('categories').where({ id }).delete();
    if (!deleted) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }

  private buildTree(categories: any[], parentId: string | null = null): any[] {
    return categories
      .filter((cat) => cat.parent_id === parentId)
      .map((cat) => ({
        ...cat,
        children: this.buildTree(categories, cat.id),
      }));
  }
}
