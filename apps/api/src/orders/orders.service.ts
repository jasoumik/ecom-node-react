import { Injectable, Inject, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async create(createOrderDto: CreateOrderDto): Promise<any> {
    const { items, deliveryChargeId, couponCode, ...orderData } = createOrderDto;

    console.log('Creating order payload:', JSON.stringify(createOrderDto, null, 2));

    // 1. Calculate Subtotal
    let subtotal = 0;
    const orderItemsData: any[] = [];

    try {
      // Validate User
      let validUserId = null;
      if (orderData.userId) {
        const user = await this.knex('users').where({ id: orderData.userId }).first();
        if (user) validUserId = user.id;
      }

      // Process Items
      for (const item of items) {
        const product = await this.knex('products').where({ id: item.productId }).first();
        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }
        const price = parseFloat(product.price);
        subtotal += price * item.quantity;
        orderItemsData.push({
          product_id: product.id,
          product_name: product.name,
          price: price,
          quantity: item.quantity,
        });
      }

      // 2. Get Delivery Charge
      const deliveryCharge = await this.knex('delivery_charges').where({ id: deliveryChargeId }).first();
      if (!deliveryCharge) {
          throw new BadRequestException('Invalid delivery charge selected');
      }
      const deliveryAmount = parseFloat(deliveryCharge.amount);

      // 3. Apply Coupon
      let discountAmount = 0;
      let couponId = null;
      if (couponCode) {
          const coupon = await this.knex('coupons').where({ code: couponCode, is_active: true }).first();
          if (coupon) {
              // Validate expiry and min amount
              if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
                  throw new BadRequestException('Coupon expired');
              }
              if (subtotal < parseFloat(coupon.min_order_amount)) {
                  throw new BadRequestException(`Minimum order amount for this coupon is ${coupon.min_order_amount}`);
              }

              couponId = coupon.id;
              if (coupon.type === 'percentage') {
                  discountAmount = (subtotal * parseFloat(coupon.value)) / 100;
              } else {
                  discountAmount = parseFloat(coupon.value);
              }
              // Ensure discount doesn't exceed subtotal
              if (discountAmount > subtotal) discountAmount = subtotal;
          }
      }

      const totalAmount = subtotal + deliveryAmount - discountAmount;

      // Transaction
      return await this.knex.transaction(async (trx) => {
        const orderInsertData = {
          user_id: validUserId,
          customer_name: orderData.customerName,
          customer_phone: orderData.customerPhone,
          customer_address: orderData.customerAddress,
          subtotal: subtotal,
          delivery_charge: deliveryAmount,
          discount: discountAmount,
          total_amount: totalAmount,
          coupon_id: couponId,
          status: 'pending',
        };
        
        const [order] = await trx('orders').insert(orderInsertData).returning('*');

        const itemsToInsert = orderItemsData.map((item: any) => ({
          ...item,
          order_id: order.id,
        }));

        await trx('order_items').insert(itemsToInsert);

        return { ...order, items: itemsToInsert };
      });
    } catch (error) {
      console.error('Error creating order:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(`Failed to create order: ${error.message}`);
    }
  }

  async findAll(): Promise<any[]> {
    const orders = await this.knex('orders').select('*').orderBy('created_at', 'desc');
    for (const order of orders) {
        order.items = await this.knex('order_items').where({ order_id: order.id });
    }
    return orders;
  }

  async findByUser(userId: string): Promise<any[]> {
    const orders = await this.knex('orders').where({ user_id: userId }).orderBy('created_at', 'desc');
    for (const order of orders) {
        order.items = await this.knex('order_items').where({ order_id: order.id });
    }
    return orders;
  }

  async findOne(id: string): Promise<any> {
    const order = await this.knex('orders').where({ id }).first();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    order.items = await this.knex('order_items').where({ order_id: id });
    return order;
  }

  async updateStatus(id: string, status: string): Promise<any> {
    const [order] = await this.knex('orders')
      .where({ id })
      .update({ status })
      .returning('*');
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async cancelOrder(id: string, userId: string): Promise<any> {
    const order = await this.knex('orders').where({ id, user_id: userId }).first();
    if (!order) {
        throw new NotFoundException('Order not found');
    }
    if (order.status !== 'pending') {
        throw new BadRequestException('Only pending orders can be cancelled');
    }
    
    const [updatedOrder] = await this.knex('orders')
        .where({ id })
        .update({ status: 'cancelled' })
        .returning('*');
        
    return updatedOrder;
  }
}
