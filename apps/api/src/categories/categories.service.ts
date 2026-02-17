import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { slugify } from '../utils/slugify';

@Injectable()
export class CategoriesService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async findAll(publicOnly: boolean = false, ageId?: string) {
    let query = this.knex('categories').select('*').orderBy('created_at', 'desc');
    
    if (publicOnly) {
        query.where('is_active', true);
    }
    
    const categories = await query;
    
    // If filtering by age, we need to find categories that have products associated with this age group
    if (ageId && ageId !== 'undefined' && ageId !== 'null') {
        // Find products that match this age group
        const products = await this.knex('products')
            .where('age_groups', 'like', `%${ageId}%`)
            .andWhere('is_active', true)
            .andWhere('stock', '>', 0)
            .select('category_id')
            .distinct();
            
        if (products.length === 0) {
            return [];
        }
            
        const categoryIdsWithProducts = new Set(products.map(p => p.category_id).filter(Boolean));
        
        // Filter categories to only include those that have products for this age group
        // Or are parents of such categories
        
        // Helper to check if a category or its descendants have products
        const hasRelevantProducts = (catId: string): boolean => {
            if (categoryIdsWithProducts.has(catId)) return true;
            const children = categories.filter(c => c.parent_id === catId);
            return children.some(child => hasRelevantProducts(child.id));
        };

        const relevantCategories = categories.filter(cat => hasRelevantProducts(cat.id));
        return this.buildTree(relevantCategories);
    }
    
    // If publicOnly, we want to filter out categories that have no products AND no children with products
    if (publicOnly) {
        // Get product counts for all categories
        const productCounts = await this.knex('products')
            .select('category_id')
            .count('* as count')
            .where('is_active', true) // Only count active products
            .where('stock', '>', 0)
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

  async findOne(idOrSlug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    
    const query = this.knex('categories');
    if (isUuid) {
        query.where('id', idOrSlug);
    } else {
        query.where('slug', idOrSlug);
    }
    
    const category = await query.first();
    
    if (!category) {
      throw new NotFoundException(`Category not found`);
    }
    // Get children
    const children = await this.knex('categories').where({ parent_id: category.id });
    return { ...category, children };
  }

  async create(createCategoryDto: CreateCategoryDto) {
    let slug = createCategoryDto.slug;
    if (!slug) {
        slug = slugify(createCategoryDto.name);
    }
    
    let counter = 1;
    let originalSlug = slug;
    while (await this.knex('categories').where({ slug }).first()) {
        slug = `${originalSlug}-${counter}`;
        counter++;
    }

    const [category] = await this.knex('categories').insert({
        ...createCategoryDto,
        slug
    }).returning('*');
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const dataToUpdate = { ...updateCategoryDto };
    
    if (dataToUpdate.slug) {
        let slug = dataToUpdate.slug;
        let counter = 1;
        let originalSlug = slug;
        while (await this.knex('categories').where({ slug }).whereNot({ id }).first()) {
            slug = `${originalSlug}-${counter}`;
            counter++;
        }
        dataToUpdate.slug = slug;
    }

    const [category] = await this.knex('categories')
      .where({ id })
      .update(dataToUpdate)
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
