import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async create(createReviewDto: CreateReviewDto) {
    // If orderId is provided, validate it
    if (createReviewDto.orderId) {
        // 1. Verify Order exists and is delivered
        const order = await this.knex('orders')
            .where({ id: createReviewDto.orderId, user_id: createReviewDto.userId })
            .first();

        if (!order) {
            throw new NotFoundException('Order not found');
        }
        if (order.status !== 'delivered' && order.status !== 'completed') {
            throw new BadRequestException('You can only review delivered orders');
        }

        // 2. Verify Product is in Order
        const orderItem = await this.knex('order_items')
            .where({ order_id: createReviewDto.orderId, product_id: createReviewDto.productId })
            .first();

        if (!orderItem) {
            throw new BadRequestException('Product not found in this order');
        }

        // 3. Check for existing review
        const existing = await this.knex('reviews')
            .where({ order_id: createReviewDto.orderId, product_id: createReviewDto.productId })
            .first();

        if (existing) {
            throw new BadRequestException('You have already reviewed this product for this order');
        }
    } else {
        // Manual Review (Admin created or special case)
        // We might want to check if user exists, but userId is required in DTO
    }

    // 4. Create Review
    const [review] = await this.knex('reviews').insert({
        product_id: createReviewDto.productId,
        user_id: createReviewDto.userId,
        order_id: createReviewDto.orderId || null,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
        images: createReviewDto.images ? JSON.stringify(createReviewDto.images) : null,
        status: createReviewDto.orderId ? 'pending' : 'approved' // Auto-approve manual reviews? Or keep pending. Let's auto-approve if no orderId (admin created)
    }).returning('*');

    return review;
  }

  async findAll(page: number = 1, limit: number = 10, status?: string) {
    const offset = (page - 1) * limit;
    
    const baseQuery = this.knex('reviews')
        .join('users', 'reviews.user_id', 'users.id')
        .join('products', 'reviews.product_id', 'products.id');

    if (status) {
        baseQuery.where('reviews.status', status);
    }

    const [countResult] = await baseQuery.clone().count('* as total');
    const total = parseInt(countResult.total as string, 10);

    const data = await baseQuery.clone()
        .select(
            'reviews.*',
            'users.name as user_name',
            'products.name as product_name',
            'products.images as product_image'
        )
        .limit(limit)
        .offset(offset)
        .orderBy('reviews.created_at', 'desc');

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

  async findByProduct(productId: string) {
      return this.knex('reviews')
        .join('users', 'reviews.user_id', 'users.id')
        .select('reviews.*', 'users.name as user_name', 'users.avatar as user_avatar')
        .where({ product_id: productId, status: 'approved' })
        .orderBy('rating', 'desc') // Highest rating first
        .orderBy('created_at', 'desc') // Then latest
        .limit(3); // Only top 3
  }

  async updateStatus(id: string, status: string) {
      const [review] = await this.knex('reviews').where({ id }).update({ status }).returning('*');
      return review;
  }

  async delete(id: string) {
      await this.knex('reviews').where({ id }).delete();
  }
}
