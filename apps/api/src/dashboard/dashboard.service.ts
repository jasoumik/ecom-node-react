import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class DashboardService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async getStats() {
    // Use first() to get the single row result for count/sum
    const products = await this.knex('products').count('* as count').first();
    const orders = await this.knex('orders').count('* as count').first();
    
    // Filter users by role 'customer'
    const users = await this.knex('users')
        .where({ role: 'customer' })
        .count('* as count')
        .first();

    const revenue = await this.knex('orders').sum('total_amount as total').first();

    console.log('Dashboard Stats Raw:', { products, orders, users, revenue });

    // Recent orders
    const recentOrders = await this.knex('orders')
      .select('id', 'order_number', 'customer_name', 'total_amount', 'status', 'created_at')
      .orderBy('created_at', 'desc')
      .limit(5);

    return {
      totalProducts: parseInt(products?.count as string || '0', 10),
      totalOrders: parseInt(orders?.count as string || '0', 10),
      totalUsers: parseInt(users?.count as string || '0', 10),
      totalRevenue: parseFloat(revenue?.total as string || '0'),
      recentOrders,
    };
  }
}
