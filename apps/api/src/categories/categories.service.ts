import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async findAll(publicOnly: boolean = false) {
    let query = this.knex('categories').select('*');
    
    if (publicOnly) {
        query.where('is_active', true);
    }
    
    const categories = await query;
    
    // If publicOnly, we want to filter out categories that have no products AND no children with products
    if (publicOnly) {
        // Get product counts for all categories
        const productCounts = await this.knex('products')
            .select('category_id')
            .count('* as count')
            .where('stock', '>', 0) // Only count in-stock products? Maybe.
            .groupBy('category_id');
            
        const countMap = productCounts.reduce<Record<string, number>>((acc, curr) => {
            acc[curr.category_id] = parseInt(curr.count as string, 10);
            return acc;
        }, {});

        return this.buildTreeWithFilter(categories, null, countMap);
    }

    return this.buildTree(categories);
  }

  private buildTree(categories: any[], parentId: string | null = null): any[] {
    return categories
      .filter(cat => cat.parent_id === parentId)
      .map(cat => ({
        ...cat,
        children: this.buildTree(categories, cat.id)
      }));
  }

  private buildTreeWithFilter(categories: any[], parentId: string | null, countMap: Record<string, number>, parentHasProducts: boolean = false): any[] {
      return categories
        .filter(cat => cat.parent_id === parentId)
        .map(cat => {
            const productCount = countMap[cat.id] || 0;
            const hasProducts = productCount > 0;
            // Pass true to children if this category has products
            const children = this.buildTreeWithFilter(categories, cat.id, countMap, hasProducts);
            const hasChildrenWithProducts = children.length > 0;
            
            // Include this category if:
            // 1. It has products, OR
            // 2. It has children with products, OR
            // 3. Its parent has products (so subcategories are shown)
            if (hasProducts || hasChildrenWithProducts || parentHasProducts) {
                return { ...cat, children, productCount };
            }
            return null;
        })
        .filter(Boolean);
  }

  async findOne(id: string) {
    const category = await this.knex('categories').where({ id }).first();
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    // Get children
    const children = await this.knex('categories').where({ parent_id: id });
    return { ...category, children };
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const [category] = await this.knex('categories').insert(createCategoryDto).returning('*');
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const [category] = await this.knex('categories')
      .where({ id })
      .update(updateCategoryDto)
      .returning('*');
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async remove(id: string) {
    const deletedCount = await this.knex('categories').where({ id }).delete();
    if (deletedCount === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }
}
