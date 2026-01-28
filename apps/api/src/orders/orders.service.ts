import { Injectable, Inject, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateManualOrderDto } from './dto/create-manual-order.dto';
import { NotificationService } from '../notification/notification.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class OrdersService {
  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly notificationService: NotificationService,
    private readonly settingsService: SettingsService
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<any> {
    const { items, deliveryChargeId, couponCode, paymentMethod, transactionId, ...orderData } = createOrderDto;

    console.log('Creating order payload:', JSON.stringify(createOrderDto, null, 2));

    let subtotal = 0;
    const orderItemsData: any[] = [];

    try {
      let validUserId = null;
      if (orderData.userId) {
        const user = await this.knex('users').where({ id: orderData.userId }).first();
        if (user) validUserId = user.id;
      }

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

      const deliveryCharge = await this.knex('delivery_charges').where({ id: deliveryChargeId }).first();
      if (!deliveryCharge) {
          throw new BadRequestException('Invalid delivery charge selected');
      }
      const deliveryAmount = parseFloat(deliveryCharge.amount);

      // Free Shipping Logic
      const freeShippingThresholdStr = await this.settingsService.getValue('free_shipping_threshold');
      const freeShippingThreshold = freeShippingThresholdStr ? parseFloat(freeShippingThresholdStr) : Infinity;
      const isFreeShipping = subtotal >= freeShippingThreshold;

      let discountAmount = 0;
      let couponId = null;
      
      // Apply Coupon
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
                  discountAmount += (subtotal * parseFloat(coupon.value)) / 100;
              } else {
                  discountAmount += parseFloat(coupon.value);
              }
          }
      }

      // Apply Free Shipping as Discount
      if (isFreeShipping) {
          discountAmount += deliveryAmount;
      }

      // Ensure discount doesn't exceed total (subtotal + delivery)
      if (discountAmount > (subtotal + deliveryAmount)) {
          discountAmount = subtotal + deliveryAmount;
      }

      const totalAmount = subtotal + deliveryAmount - discountAmount;

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

        // Initial History Log
        await trx('order_history').insert({
            order_id: order.id,
            status: 'pending',
            comment: 'Order placed'
        });

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
                reason: `Order #${order.order_number}`,
                order_id: order.id
            });
        }

        // Send Notifications (Async, don't block)
        this.sendOrderNotifications(order);

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

        // Initial History Log
        await trx('order_history').insert({
            order_id: order.id,
            status: orderData.status,
            comment: 'Manual Order Created'
        });

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

  private async sendOrderNotifications(order: any) {
      const customerMsg = `Dear ${order.customer_name}, your order #${order.order_number} has been placed successfully. Total: ${order.total_amount}. We will contact you soon.`;
      const adminMsg = `New Order #${order.order_number} received from ${order.customer_name}. Total: ${order.total_amount}.`;
      const adminPhone = process.env.ADMIN_PHONE || '01700000000';
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

      // Customer Notification
      await this.notificationService.sendSMS(order.customer_phone, customerMsg);
      // If we had customer email, we'd send email too. Assuming user might have email in users table if registered.
      if (order.user_id) {
          const user = await this.knex('users').where({ id: order.user_id }).first();
          if (user && user.email) {
              await this.notificationService.sendEmail(user.email, `Order #${order.order_number} Placed`, customerMsg);
          }
      }

      // Admin Notification
      await this.notificationService.sendSMS(adminPhone, adminMsg);
      await this.notificationService.sendEmail(adminEmail, `New Order #${order.order_number}`, adminMsg);
      await this.notificationService.sendWhatsApp(adminPhone, adminMsg);
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
    
    const items = await this.knex('order_items').where({ order_id: id });
    const reviews = await this.knex('reviews').where({ order_id: id });
    const history = await this.knex('order_history').where({ order_id: id }).orderBy('created_at', 'asc');
    
    order.items = items.map(item => {
        const review = reviews.find(r => r.product_id === item.product_id);
        return {
            ...item,
            review: review || null
        };
    });
    
    order.history = history;
    
    return order;
  }

  async updateStatus(id: string, status: string, comment?: string, userId?: string): Promise<any> {
    const order = await this.knex('orders').where({ id }).first();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Workflow Validation
    const currentStatus = order.status;
    
    if (status === 'delivered' && currentStatus === 'pending') {
        throw new BadRequestException('Cannot mark Pending order as Delivered directly. Must be Shipped first.');
    }

    return await this.knex.transaction(async (trx) => {
        const [updatedOrder] = await trx('orders')
          .where({ id })
          .update({ status })
          .returning('*');
        
        await trx('order_history').insert({
            order_id: id,
            status: status,
            comment: comment || `Status updated to ${status}`,
            updated_by: userId || null
        });
        
        // Notify customer on status change
        const msg = `Your order #${order.order_number} status has been updated to: ${status}.`;
        await this.notificationService.sendSMS(order.customer_phone, msg);
        
        return updatedOrder;
    });
  }

  async cancelOrder(id: string, userId: string): Promise<any> {
    const order = await this.knex('orders').where({ id, user_id: userId }).first();
    if (!order) {
        throw new NotFoundException('Order not found');
    }
    if (order.status !== 'pending') {
        throw new BadRequestException('Only pending orders can be cancelled');
    }
    
    const items = await this.knex('order_items').where({ order_id: id });
    await this.knex.transaction(async (trx) => {
        for (const item of items) {
            if (item.variant_id) {
                await trx('product_variants').where({ id: item.variant_id }).increment('stock', item.quantity);
                await trx('products').where({ id: item.product_id }).increment('stock', item.quantity);
            } else {
                await trx('products').where({ id: item.product_id }).increment('stock', item.quantity);
            }

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

        await trx('order_history').insert({
            order_id: id,
            status: 'cancelled',
            comment: 'Order cancelled by user'
        });
    });
        
    return { ...order, status: 'cancelled' };
  }
}
