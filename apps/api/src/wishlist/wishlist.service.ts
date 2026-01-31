import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class WishlistService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async addToWishlist(userId: string, productId: string) {
    // Check if already exists
    const existing = await this.knex('wishlist_items')
      .where({ user_id: userId, product_id: productId })
      .first();

    if (existing) return existing;

    const [item] = await this.knex('wishlist_items')
      .insert({ user_id: userId, product_id: productId })
      .returning('*');
    return item;
  }

  async removeFromWishlist(userId: string, productId: string) {
    await this.knex('wishlist_items')
      .where({ user_id: userId, product_id: productId })
      .delete();
  }

  async getWishlist(userId: string) {
    return this.knex('wishlist_items')
      .join('products', 'wishlist_items.product_id', 'products.id')
      .select(
        'products.id',
        'products.name',
        'products.price',
        'products.images',
        'wishlist_items.created_at'
      )
      .where('wishlist_items.user_id', userId)
      .orderBy('wishlist_items.created_at', 'desc');
  }

  async getAllWishlists(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const baseQuery = this.knex('wishlist_items');
    
    const [countResult] = await baseQuery.clone().count('* as total');
    const total = parseInt(countResult.total as string, 10);

    const data = await baseQuery
      .join('users', 'wishlist_items.user_id', 'users.id')
      .join('products', 'wishlist_items.product_id', 'products.id')
      .select(
        'wishlist_items.id',
        'wishlist_items.created_at',
        'users.name as user_name',
        'users.phone as user_phone',
        'products.name as product_name',
        'products.price as product_price'
      )
      .limit(limit)
      .offset(offset)
      .orderBy('wishlist_items.created_at', 'desc');

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
}
