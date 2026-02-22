import {
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateManualOrderDto } from './dto/create-manual-order.dto';
import { NotificationService } from '../notification/notification.service';
import { SettingsService } from '../settings/settings.service';
import { InvoiceService } from './invoice.service';

@Injectable()
export class OrdersService {
  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly notificationService: NotificationService,
    private readonly settingsService: SettingsService,
    private readonly invoiceService: InvoiceService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<any> {
    const {
      items,
      deliveryChargeId,
      couponCode,
      paymentMethod,
      transactionId,
      paymentPhone,
      isGift,
      giftMessage,
      redeemPoints,
      ...orderData
    } = createOrderDto;

    console.log(
      'Creating order payload:',
      JSON.stringify(createOrderDto, null, 2),
    );

    let subtotal = 0;
    const orderItemsData: any[] = [];

    try {
      let validUserId = null;
      let userPoints = 0;

      if (orderData.userId) {
        const user = await this.knex('users')
          .where({ id: orderData.userId })
          .first();
        if (user) {
            validUserId = user.id;
            userPoints = user.points || 0;
        }
      } else {
        const user = await this.knex('users')
          .where({ phone: orderData.customerPhone })
          .first();
        if (user) {
            validUserId = user.id;
            userPoints = user.points || 0;
        }
      }

      for (const item of items) {
        const product = await this.knex('products')
          .where({ id: item.productId })
          .first();
        if (!product) {
          throw new NotFoundException(
            `Product with ID ${item.productId} not found`,
          );
        }

        let price = parseFloat(product.price);
        let variantId = null;

        if ((item as any).variantId) {
          const variant = await this.knex('product_variants')
            .where({ id: (item as any).variantId })
            .first();
          if (variant) {
            price = variant.price ? parseFloat(variant.price) : price;
            variantId = variant.id;

            if (variant.stock < item.quantity) {
              throw new BadRequestException(
                `Insufficient stock for variant of ${product.name}`,
              );
            }
          }
        } else {
          if (product.stock < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for ${product.name}`,
            );
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

      const deliveryCharge = await this.knex('delivery_charges')
        .where({ id: deliveryChargeId })
        .first();
      if (!deliveryCharge) {
        throw new BadRequestException('Invalid delivery charge selected');
      }
      const deliveryAmount = parseFloat(deliveryCharge.amount);

      const freeShippingThresholdStr = await this.settingsService.getValue(
        'free_shipping_threshold',
      );
      const freeShippingThreshold = freeShippingThresholdStr
        ? parseFloat(freeShippingThresholdStr)
        : Infinity;
      const isFreeShipping = subtotal >= freeShippingThreshold;

      let discountAmount = 0;
      let couponId = null;

      if (couponCode) {
        const coupon = await this.knex('coupons')
          .where({ code: couponCode, is_active: true })
          .first();
        if (coupon) {
          if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            throw new BadRequestException('Coupon expired');
          }
          if (subtotal < parseFloat(coupon.min_order_amount)) {
            throw new BadRequestException(
              `Minimum order amount for this coupon is ${coupon.min_order_amount}`,
            );
          }

          couponId = coupon.id;
          if (coupon.type === 'percentage') {
            discountAmount += (subtotal * parseFloat(coupon.value)) / 100;
          } else {
            discountAmount += parseFloat(coupon.value);
          }
        }
      }

      if (isFreeShipping) {
        discountAmount += deliveryAmount;
      }

      let pointsDiscount = 0;
      let pointsRedeemed = 0;

      if (redeemPoints && redeemPoints > 0) {
          if (!validUserId) {
              throw new BadRequestException('Must be logged in to redeem points');
          }
          if (redeemPoints > userPoints) {
              throw new BadRequestException('Insufficient points');
          }

          const redemptionRateStr = await this.settingsService.getValue('points_redemption_rate') || '0.1';
          const redemptionRate = parseFloat(redemptionRateStr);
          
          pointsDiscount = redeemPoints * redemptionRate;
          pointsRedeemed = redeemPoints;
          
          const remainingTotal = subtotal + deliveryAmount - discountAmount;
          if (pointsDiscount > remainingTotal) {
              pointsDiscount = remainingTotal;
              pointsRedeemed = Math.ceil(pointsDiscount / redemptionRate);
          }
      }

      let totalDiscount = discountAmount + pointsDiscount;
      if (totalDiscount > subtotal + deliveryAmount) {
          totalDiscount = subtotal + deliveryAmount;
      }

      const totalAmount = subtotal + deliveryAmount - totalDiscount;

      const earningRateStr = await this.settingsService.getValue('points_earning_rate') || '1';
      const earningRate = parseFloat(earningRateStr);
      const pointsEarned = Math.floor((totalAmount / 100) * earningRate);

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
          payment_phone: paymentPhone || null,
          status: 'pending',
          order_source: 'Website',
          payment_status: 'Pending',
          is_gift: isGift || false,
          gift_message: giftMessage || null,
          points_redeemed: pointsRedeemed,
          points_discount: pointsDiscount,
          points_earned: pointsEarned
        };

        const [order] = await trx('orders')
          .insert(orderInsertData)
          .returning('*');

        const itemsToInsert = orderItemsData.map((item: any) => ({
          ...item,
          order_id: order.id,
        }));

        await trx('order_items').insert(itemsToInsert);

        if (pointsRedeemed > 0 && validUserId) {
            await trx('users').where({ id: validUserId }).decrement('points', pointsRedeemed);
        }

        await trx('order_history').insert({
          order_id: order.id,
          status: 'pending',
          comment: 'Order placed',
        });

        for (const item of orderItemsData) {
          if (item.variant_id) {
            await trx('product_variants')
              .where({ id: item.variant_id })
              .decrement('stock', item.quantity);
            await trx('products')
              .where({ id: item.product_id })
              .decrement('stock', item.quantity);
          } else {
            await trx('products')
              .where({ id: item.product_id })
              .decrement('stock', item.quantity);
          }

          await trx('stock_movements').insert({
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity_change: -item.quantity,
            type: 'sale',
            reason: `Order #${order.order_number}`,
            order_id: order.id,
          });
        }

        // Prepare Order Object for Invoice
        const orderForInvoice = { ...order, items: itemsToInsert };
        const pdfBuffer = await this.invoiceService.generateInvoicePdf(orderForInvoice);
        const attachments = [{
            filename: `invoice-${order.order_number}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
        }];

        this.sendOrderNotifications(order, attachments).catch(err => console.error("Notification failed", err));

        return { ...order, items: itemsToInsert };
      });
    } catch (error) {
      console.error('Error creating order:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException(
        `Failed to create order: ${error.message}`,
      );
    }
  }

  async createManual(createManualOrderDto: CreateManualOrderDto): Promise<any> {
    const { items, paidAmount, transactionId, ...orderData } = createManualOrderDto;

    let subtotal = 0;
    const orderItemsData: any[] = [];

    try {
      let validUserId = null;
      const existingUser = await this.knex('users')
        .where({ phone: orderData.customerPhone })
        .first();
      if (existingUser) {
        validUserId = existingUser.id;
      }

      for (const item of items) {
        const product = await this.knex('products')
          .where({ id: item.productId })
          .first();
        if (!product) {
          throw new NotFoundException(
            `Product with ID ${item.productId} not found`,
          );
        }

        let price = parseFloat(product.price);
        let variantId = null;

        if ((item as any).variantId) {
          const variant = await this.knex('product_variants')
            .where({ id: (item as any).variantId })
            .first();
          if (variant) {
            price = variant.price ? parseFloat(variant.price) : price;
            variantId = variant.id;

            if (variant.stock < item.quantity) {
              throw new BadRequestException(
                `Insufficient stock for variant of ${product.name}`,
              );
            }
          }
        } else {
          if (product.stock < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for ${product.name}`,
            );
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

      const totalAmount =
        subtotal + (orderData.deliveryCharge || 0) - (orderData.discount || 0);

      let paymentStatus = orderData.paymentStatus;
      const amountPaid = paidAmount || 0;
      
      if (amountPaid >= totalAmount) {
          paymentStatus = 'Paid';
      } else if (amountPaid > 0) {
          paymentStatus = 'Partial';
      } else {
          paymentStatus = 'Pending';
      }

      return await this.knex.transaction(async (trx) => {
        const orderInsertData = {
          user_id: validUserId,
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
          payment_status: paymentStatus,
          paid_amount: amountPaid,
          transaction_id: transactionId || null
        };

        const [order] = await trx('orders')
          .insert(orderInsertData)
          .returning('*');

        const itemsToInsert = orderItemsData.map((item: any) => ({
          ...item,
          order_id: order.id,
        }));

        await trx('order_items').insert(itemsToInsert);

        if (amountPaid > 0) {
            await trx('payments').insert({
                order_id: order.id,
                amount: amountPaid,
                method: orderData.paymentMethod,
                transaction_id: transactionId || null,
                note: 'Initial payment on manual order creation'
            });
        }

        await trx('order_history').insert({
          order_id: order.id,
          status: orderData.status,
          comment: 'Manual Order Created',
        });

        for (const item of orderItemsData) {
          if (item.variant_id) {
            await trx('product_variants')
              .where({ id: item.variant_id })
              .decrement('stock', item.quantity);
            await trx('products')
              .where({ id: item.product_id })
              .decrement('stock', item.quantity);
          } else {
            await trx('products')
              .where({ id: item.product_id })
              .decrement('stock', item.quantity);
          }

          await trx('stock_movements').insert({
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity_change: -item.quantity,
            type: 'sale',
            reason: `Manual Order #${order.order_number}`,
            order_id: order.id,
          });
        }

        // Prepare Order Object for Invoice
        const orderForInvoice = { ...order, items: itemsToInsert };
        const pdfBuffer = await this.invoiceService.generateInvoicePdf(orderForInvoice);
        const attachments = [{
            filename: `invoice-${order.order_number}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
        }];

        this.sendOrderNotifications(order, attachments).catch(err => console.error("Notification failed", err));

        return { ...order, items: itemsToInsert };
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException(
        `Failed to create manual order: ${error.message}`,
      );
    }
  }

  async addPayment(orderId: string, amount: number, method: string, transactionId?: string, note?: string): Promise<any> {
      const order = await this.knex('orders').where({ id: orderId }).first();
      if (!order) {
          throw new NotFoundException('Order not found');
      }

      const newPaidAmount = parseFloat(order.paid_amount || 0) + amount;
      let newStatus = order.payment_status;
      
      if (newPaidAmount >= parseFloat(order.total_amount)) {
          newStatus = 'Paid';
      } else if (newPaidAmount > 0) {
          newStatus = 'Partial';
      }

      return await this.knex.transaction(async (trx) => {
          await trx('payments').insert({
              order_id: orderId,
              amount,
              method,
              transaction_id: transactionId,
              note
          });

          const [updatedOrder] = await trx('orders')
              .where({ id: orderId })
              .update({
                  paid_amount: newPaidAmount,
                  payment_status: newStatus
              })
              .returning('*');
          
          return updatedOrder;
      });
  }

  private async sendOrderNotifications(order: any, attachments: any[] = []) {
    const customerMsg = `Dear ${order.customer_name}, your order #${order.order_number} has been placed successfully. Total: ${order.total_amount}. We will contact you soon.`;
    const adminMsg = `New Order #${order.order_number} received from ${order.customer_name}. Total: ${order.total_amount}.`;
    const adminPhone = process.env.ADMIN_PHONE || '01616684803';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

    await this.notificationService.sendSMS(order.customer_phone, customerMsg);
    
    if (order.user_id) {
      const user = await this.knex('users')
        .where({ id: order.user_id })
        .first();
      if (user && user.email) {
        // Use Template for Email
        const sent = await this.notificationService.sendTemplateEmail(user.email, 'order_placed', {
            customer_name: order.customer_name,
            order_number: order.order_number,
            total_amount: order.total_amount
        }, attachments); // Pass attachments
        
        if (!sent) {
            // Fallback if template fails
            await this.notificationService.sendEmail(
              user.email,
              `Order #${order.order_number} Placed`,
              customerMsg,
              undefined,
              attachments // Pass attachments
            );
        }
      }
    }

    await this.notificationService.sendSMS(adminPhone, adminMsg);
    await this.notificationService.sendEmail(
      adminEmail,
      `New Order #${order.order_number}`,
      adminMsg,
      undefined,
      attachments // Pass attachments to admin too
    );
    await this.notificationService.sendWhatsApp(adminPhone, adminMsg);
  }

  async findAll(search?: string): Promise<any[]> {
    const query = this.knex('orders').select('*').orderBy('created_at', 'desc');
    
    if (search) {
        query.where(function() {
            this.where('order_number', 'like', `%${search}%`)
                .orWhere('customer_name', 'ilike', `%${search}%`)
                .orWhere('customer_phone', 'like', `%${search}%`);
        });
    }

    const orders = await query;
    
    for (const order of orders) {
      order.items = await this.knex('order_items').where({
        order_id: order.id,
      });
    }
    return orders;
  }

  async findByUser(userId: string): Promise<any[]> {
    const orders = await this.knex('orders')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');
    for (const order of orders) {
      order.items = await this.knex('order_items').where({
        order_id: order.id,
      });
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
    const history = await this.knex('order_history')
      .where({ order_id: id })
      .orderBy('created_at', 'asc');
    
    const payments = await this.knex('payments').where({ order_id: id }).orderBy('created_at', 'desc');

    order.items = items.map((item) => {
      const review = reviews.find((r) => r.product_id === item.product_id);
      return {
        ...item,
        review: review || null,
      };
    });

    order.history = history;
    order.payments = payments;

    return order;
  }

  async updateStatus(
    id: string,
    status: string,
    comment?: string,
    userId?: string,
  ): Promise<any> {
    const order = await this.knex('orders').where({ id }).first();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const currentStatus = order.status;

    if (status === 'delivered' && currentStatus === 'pending') {
      throw new BadRequestException(
        'Cannot mark Pending order as Delivered directly. Must be Shipped first.',
      );
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
        updated_by: userId || null,
      });

      // Handle Stock Restoration if status is changed to 'cancelled'
      if (status === 'cancelled' && currentStatus !== 'cancelled') {
          const items = await trx('order_items').where({ order_id: id });
          for (const item of items) {
              if (item.variant_id) {
                  await trx('product_variants')
                      .where({ id: item.variant_id })
                      .increment('stock', item.quantity);
                  await trx('products')
                      .where({ id: item.product_id })
                      .increment('stock', item.quantity);
              } else {
                  await trx('products')
                      .where({ id: item.product_id })
                      .increment('stock', item.quantity);
              }

              await trx('stock_movements').insert({
                  product_id: item.product_id,
                  variant_id: item.variant_id,
                  quantity_change: item.quantity,
                  type: 'cancellation_restock',
                  reason: `Order #${order.order_number} Cancelled by Admin`,
                  order_id: order.id,
              });
          }

          // Refund points if any were redeemed
          if (order.points_redeemed > 0 && order.user_id) {
              await trx('users').where({ id: order.user_id }).increment('points', order.points_redeemed);
          }
      }

      if (status === 'delivered' && currentStatus !== 'delivered' && order.points_earned > 0 && order.user_id) {
          console.log(`Awarding ${order.points_earned} points to user ${order.user_id} for order ${order.id}`);
          await trx('users').where({ id: order.user_id }).increment('points', order.points_earned);
      }

      try {
          // Only email notification for status updates; no SMS
          if (order.user_id) {
              const user = await trx('users').where({ id: order.user_id }).first();
              if (user && user.email) {
                  await this.notificationService.sendTemplateEmail(user.email, 'order_status_update', {
                      customer_name: order.customer_name,
                      order_number: order.order_number,
                      status: status,
                  });
              }
          }
      } catch (e) {
          console.error("Failed to send status update notification", e);
      }

      return updatedOrder;
    });
  }

  async cancelOrder(id: string, userId: string): Promise<any> {
    const order = await this.knex('orders')
      .where({ id, user_id: userId })
      .first();
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
          await trx('product_variants')
            .where({ id: item.variant_id })
            .increment('stock', item.quantity);
          await trx('products')
            .where({ id: item.product_id })
            .increment('stock', item.quantity);
        } else {
          await trx('products')
            .where({ id: item.product_id })
            .increment('stock', item.quantity);
        }

        await trx('stock_movements').insert({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity_change: item.quantity,
          type: 'cancellation_restock',
          reason: `Order #${order.order_number} Cancelled`,
          order_id: order.id,
        });
      }

      if (order.points_redeemed > 0 && order.user_id) {
          await trx('users').where({ id: order.user_id }).increment('points', order.points_redeemed);
      }

      await trx('orders').where({ id }).update({ status: 'cancelled' });

      await trx('order_history').insert({
        order_id: id,
        status: 'cancelled',
        comment: 'Order cancelled by user',
      });
    });

    return { ...order, status: 'cancelled' };
  }
}
