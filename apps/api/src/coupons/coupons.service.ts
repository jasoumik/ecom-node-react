import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async findAll(includeInactive: boolean = false): Promise<any[]> {
    const query = this.knex('coupons').select('*').orderBy('created_at', 'desc');
    if (!includeInactive) {
      query.where('is_active', true);
    }
    return query;
  }

  async findOne(id: string): Promise<any> {
    const coupon = await this.knex('coupons').where({ id }).first();
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
    return coupon;
  }

  async create(createCouponDto: CreateCouponDto): Promise<any> {
    // Check for duplicate code
    const existing = await this.knex('coupons')
      .where('code', createCouponDto.code.toUpperCase())
      .first();
    if (existing) {
      throw new BadRequestException(`Coupon with code "${createCouponDto.code}" already exists`);
    }

    const [coupon] = await this.knex('coupons')
      .insert({
        ...createCouponDto,
        code: createCouponDto.code.toUpperCase(),
      })
      .returning('*');
    return coupon;
  }

  async update(id: string, updateCouponDto: UpdateCouponDto): Promise<any> {
    // Check if code is being changed and is already taken
    if (updateCouponDto.code) {
      const existing = await this.knex('coupons')
        .where('code', updateCouponDto.code.toUpperCase())
        .whereNot({ id })
        .first();
      if (existing) {
        throw new BadRequestException(`Coupon with code "${updateCouponDto.code}" already exists`);
      }
      updateCouponDto.code = updateCouponDto.code.toUpperCase();
    }

    const [coupon] = await this.knex('coupons')
      .where({ id })
      .update(updateCouponDto)
      .returning('*');

    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
    return coupon;
  }

  async validate(code: string, orderAmount: number, userId?: string, productIds?: string[], categoryIds?: string[]): Promise<any> {
    const coupon = await this.knex('coupons')
      .where({ code: code.toUpperCase(), is_active: true })
      .first();

    if (!coupon) {
      throw new NotFoundException('Invalid coupon code');
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Check if coupon has started
    if (coupon.starts_at && coupon.starts_at > today) {
      throw new BadRequestException('This coupon is not yet active');
    }

    // Check expiry (unless no_expiry is true)
    if (!coupon.no_expiry && coupon.expires_at && coupon.expires_at < today) {
      throw new BadRequestException('Coupon has expired');
    }

    // Check minimum order amount
    if (orderAmount < parseFloat(coupon.min_order_amount || 0)) {
      throw new BadRequestException(`Minimum order amount for this coupon is ৳${coupon.min_order_amount}`);
    }

    // Check total usage limit
    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }

    // Check per-user usage limit
    if (userId && coupon.usage_limit_per_user) {
      const userUsageCount = await this.knex('coupon_usages')
        .where({ coupon_id: coupon.id, user_id: userId })
        .count('* as count')
        .first();

      if (userUsageCount && parseInt(userUsageCount.count as string, 10) >= coupon.usage_limit_per_user) {
        throw new BadRequestException('You have already used this coupon the maximum number of times');
      }
    }

    // Check first order only
    if (coupon.first_order_only && userId) {
      const previousOrders = await this.knex('orders')
        .where({ user_id: userId })
        .whereNot('status', 'cancelled')
        .count('* as count')
        .first();

      if (previousOrders && parseInt(previousOrders.count as string, 10) > 0) {
        throw new BadRequestException('This coupon is only valid for first-time customers');
      }
    }

    // Check applicable products
    if (coupon.applicable_products && coupon.applicable_products.length > 0 && productIds) {
      const hasApplicableProduct = productIds.some(id => coupon.applicable_products.includes(id));
      if (!hasApplicableProduct) {
        throw new BadRequestException('This coupon is not applicable to the products in your cart');
      }
    }

    // Check excluded products
    if (coupon.excluded_products && coupon.excluded_products.length > 0 && productIds) {
      const hasExcludedProduct = productIds.every(id => coupon.excluded_products.includes(id));
      if (hasExcludedProduct) {
        throw new BadRequestException('This coupon cannot be applied to the products in your cart');
      }
    }

    // Check applicable categories
    if (coupon.applicable_categories && coupon.applicable_categories.length > 0 && categoryIds) {
      const hasApplicableCategory = categoryIds.some(id => coupon.applicable_categories.includes(id));
      if (!hasApplicableCategory) {
        throw new BadRequestException('This coupon is not applicable to the categories in your cart');
      }
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (orderAmount * parseFloat(coupon.value)) / 100;
      // Apply max discount cap if set
      if (coupon.max_discount_amount && discount > parseFloat(coupon.max_discount_amount)) {
        discount = parseFloat(coupon.max_discount_amount);
      }
    } else {
      discount = parseFloat(coupon.value);
    }

    // Ensure discount doesn't exceed order amount
    if (discount > orderAmount) {
      discount = orderAmount;
    }

    return {
      ...coupon,
      calculated_discount: discount,
    };
  }

  async recordUsage(couponId: string, userId: string | null, orderId: string, discountAmount: number): Promise<void> {
    await this.knex.transaction(async (trx) => {
      // Record the usage
      await trx('coupon_usages').insert({
        coupon_id: couponId,
        user_id: userId,
        order_id: orderId,
        discount_amount: discountAmount,
      });

      // Increment times_used
      await trx('coupons')
        .where({ id: couponId })
        .increment('times_used', 1);
    });
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.knex('coupons').where({ id }).delete();
    if (!deleted) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
  }

  async getUsageStats(couponId: string): Promise<any> {
    const coupon = await this.findOne(couponId);

    const usages = await this.knex('coupon_usages')
      .where({ coupon_id: couponId })
      .leftJoin('users', 'coupon_usages.user_id', 'users.id')
      .leftJoin('orders', 'coupon_usages.order_id', 'orders.id')
      .select(
        'coupon_usages.*',
        'users.name as user_name',
        'users.phone as user_phone',
        'orders.order_number'
      )
      .orderBy('coupon_usages.created_at', 'desc');

    const totalDiscount = usages.reduce((sum, u) => sum + parseFloat(u.discount_amount), 0);

    return {
      coupon,
      totalUsages: usages.length,
      totalDiscount,
      usages,
    };
  }
}

