import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class CouponsService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async findAll(): Promise<any[]> {
    return this.knex('coupons').select('*');
  }

  async create(data: any): Promise<any> {
    const [coupon] = await this.knex('coupons').insert(data).returning('*');
    return coupon;
  }

  async validate(code: string, orderAmount: number): Promise<any> {
    const coupon = await this.knex('coupons').where({ code, is_active: true }).first();
    
    if (!coupon) {
      throw new NotFoundException('Invalid coupon code');
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      throw new BadRequestException('Coupon expired');
    }

    if (orderAmount < parseFloat(coupon.min_order_amount)) {
      throw new BadRequestException(`Minimum order amount for this coupon is ${coupon.min_order_amount}`);
    }

    return coupon;
  }

  async delete(id: string): Promise<void> {
    await this.knex('coupons').where({ id }).delete();
  }
}
