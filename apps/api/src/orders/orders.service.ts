import { Injectable, Inject, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateManualOrderDto } from './dto/create-manual-order.dto';

@Injectable()
export class OrdersService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async create(createOrderDto: CreateOrderDto): Promise<any> {
    const { items, deliveryChargeId, couponCode, paymentMethod, transactionId, ...orderData } = createOrderDto;

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
        
        let price = parseFloat(product.price);
        let variantId = null;
        
        if ((item as any).variantId) {
            const variant = await this.knex('product_variants').where({ id: (item as any).variantId }).first();
            if (variant) {
                price = variant.price ? parseFloat(variant.price) : price;
                variantId = variant.id;
                
                if (variant.stock < item.quantity) {
                    throw new BadRequestException(`Insufficient stock for variant of ${product.name}`);
                }
            }
        } else {
            if (product.stock < item.quantity) {
                throw new BadRequestException(`Insufficient stock for ${product.name}`);
            }
        }

        subtotal += price * item.quantity;
        orderItemsData.push({
          product_id: product.id,
          variant_id: variantId,
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
          payment_method: paymentMethod || 'cod',
          transaction_id: transactionId || null,
          status: 'pending',
          order_source: 'Website',
          payment_status: 'Pending'
        };
        
        const [order] = await trx('orders').insert(orderInsertData).returning('*');

        const itemsToInsert = orderItemsData.map((item: any) => ({
          ...item,
          order_id: order.id,
        }));

        await trx('order_items').insert(itemsToInsert);

        // Deduct Stock and Record Movement
        for (const item of orderItemsData) {
            if (item.variant_id) {
                await trx('product_variants').where({ id: item.variant_id }).decrement('stock', item.quantity);
                await trx('products').where({ id: item.product_id }).decrement('stock', item.quantity);
            } else {
                await trx('products').where({ id: item.product_id }).decrement('stock', item.quantity);
            }
            
            // Record Stock Movement
            await trx('stock_movements').insert({
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity_change: -item.quantity,
                type: 'sale',
                reason: `Order #${order.order_number}`,
                order_id: order.id
            });
        }

        return { ...order, items: itemsToInsert };
      });
    } catch (error) {
      console.error('Error creating order:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(`Failed to create order: ${error.message}`);
    }
  }

  async createManual(createManualOrderDto: CreateManualOrderDto): Promise<any> {
    const { items, ...orderData } = createManualOrderDto;

    let subtotal = 0;
    const orderItemsData: any[] = [];

    try {
      for (const item of items) {
        const product = await this.knex('products').where({ id: item.productId }).first();
        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }
        
        let price = parseFloat(product.price);
        let variantId = null;
        
        if ((item as any).variantId) {
            const variant = await this.knex('product_variants').where({ id: (item as any).variantId }).first();
            if (variant) {
                price = variant.price ? parseFloat(variant.price) : price;
                variantId = variant.id;
                
                if (variant.stock < item.quantity) {
                    throw new BadRequestException(`Insufficient stock for variant of ${product.name}`);
                }
            }
        } else {
            if (product.stock < item.quantity) {
                throw new BadRequestException(`Insufficient stock for ${product.name}`);
            }
        }

        subtotal += price * item.quantity;
        orderItemsData.push({
          product_id: product.id,
          variant_id: variantId,
          product_name: product.name,
          price: price,
          quantity: item.quantity,
        });
      }

      const totalAmount = subtotal + (orderData.deliveryCharge || 0) - (orderData.discount || 0);

      return await this.knex.transaction(async (trx) => {
        const orderInsertData = {
          customer_name: orderData.customerName,
          customer_phone: orderData.customerPhone,
          customer_address: orderData.customerAddress,
          subtotal: subtotal,
          delivery_charge: orderData.deliveryCharge || 0,
          discount: orderData.discount || 0,
          total_amount: totalAmount,
          payment_method: orderData.paymentMethod,
          status: orderData.status,
          order_source: orderData.orderSource,
          payment_status: orderData.paymentStatus
        };
        
        const [order] = await trx('orders').insert(orderInsertData).returning('*');

        const itemsToInsert = orderItemsData.map((item: any) => ({
          ...item,
          order_id: order.id,
        }));

        await trx('order_items').insert(itemsToInsert);

        // Deduct Stock
        for (const item of orderItemsData) {
            if (item.variant_id) {
                await trx('product_variants').where({ id: item.variant_id }).decrement('stock', item.quantity);
                await trx('products').where({ id: item.product_id }).decrement('stock', item.quantity);
            } else {
                await trx('products').where({ id: item.product_id }).decrement('stock', item.quantity);
            }
            
            await trx('stock_movements').insert({
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity_change: -item.quantity,
                type: 'sale',
                reason: `Manual Order #${order.order_number}`,
                order_id: order.id
            });
        }

        return { ...order, items: itemsToInsert };
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(`Failed to create manual order: ${error.message}`);
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
    
    // Restore Stock and Record Movement
    const items = await this.knex('order_items').where({ order_id: id });
    await this.knex.transaction(async (trx) => {
        for (const item of items) {
            if (item.variant_id) {
                await trx('product_variants').where({ id: item.variant_id }).increment('stock', item.quantity);
                await trx('products').where({ id: item.product_id }).increment('stock', item.quantity);
            } else {
                await trx('products').where({ id: item.product_id }).increment('stock', item.quantity);
            }

            // Record Stock Movement
            await trx('stock_movements').insert({
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity_change: item.quantity,
                type: 'cancellation_restock',
                reason: `Order #${order.order_number} Cancelled`,
                order_id: order.id
            });
        }
        
        await trx('orders')
            .where({ id })
            .update({ status: 'cancelled' });
    });
        
    return { ...order, status: 'cancelled' };
  }
}
