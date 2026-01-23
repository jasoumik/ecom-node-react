import { Injectable, Inject, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async create(createOrderDto: CreateOrderDto): Promise<any> {
    const { items, ...orderData } = createOrderDto;

    console.log('Creating order payload:', JSON.stringify(createOrderDto, null, 2));

    // Calculate total amount and validate products
    let totalAmount = 0;
    const orderItemsData: any[] = [];

    try {
      // Validate User if provided
      let validUserId = null;
      if (orderData.userId) {
        const user = await this.knex('users').where({ id: orderData.userId }).first();
        if (user) {
            validUserId = user.id;
        } else {
            console.warn(`User ID ${orderData.userId} not found in DB. Proceeding as guest order.`);
        }
      }

      for (const item of items) {
        const product = await this.knex('products').where({ id: item.productId }).first();
        if (!product) {
          console.error(`Product not found: ${item.productId}`);
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }
        const price = parseFloat(product.price);
        totalAmount += price * item.quantity;
        orderItemsData.push({
          product_id: product.id,
          product_name: product.name,
          price: price,
          quantity: item.quantity,
        });
      }

      console.log('Order items prepared:', orderItemsData);
      console.log('Total amount:', totalAmount);

      // Transaction to ensure order and items are created together
      return await this.knex.transaction(async (trx) => {
        const orderInsertData = {
          user_id: validUserId, // Use validated ID or null
          customer_name: orderData.customerName,
          customer_phone: orderData.customerPhone,
          customer_address: orderData.customerAddress,
          total_amount: totalAmount,
          status: 'pending',
        };
        
        console.log('Inserting order:', orderInsertData);

        const [order] = await trx('orders').insert(orderInsertData).returning('*');

        console.log('Order inserted:', order);

        const itemsToInsert = orderItemsData.map((item: any) => ({
          ...item,
          order_id: order.id,
        }));

        console.log('Inserting items:', itemsToInsert);

        await trx('order_items').insert(itemsToInsert);

        console.log('Order created successfully:', order.id);
        return { ...order, items: itemsToInsert };
      });
    } catch (error) {
      console.error('Error creating order FULL TRACE:', error);
      if (error instanceof NotFoundException) throw error;
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
}
