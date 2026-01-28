import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { NotificationService } from '../notification/notification.service';
import { CreateStockRequestDto } from './dto/create-stock-request.dto';
import { CreateProductRequestDto } from './dto/create-product-request.dto';

@Injectable()
export class RequestsService {
  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly notificationService: NotificationService
  ) {}

  // Stock Requests
  async createStockRequest(data: CreateStockRequestDto) {
    const insertData = {
        product_id: data.productId,
        variant_id: data.variantId || null,
        phone: data.phone,
        email: data.email || null,
        status: 'pending'
    };

    const [request] = await this.knex('stock_requests').insert(insertData).returning('*');
    
    const adminMessage = `New Stock Request for Product ID: ${data.productId}. Customer: ${data.phone}`;
    await this.notificationService.sendEmail(process.env.ADMIN_EMAIL || 'admin@example.com', 'New Stock Request', adminMessage);
    
    const customerMessage = `We received your request for stock notification. We will notify you when it's available.`;
    if (data.email) await this.notificationService.sendEmail(data.email, 'Stock Request Received', customerMessage);

    return request;
  }

  async getStockRequests() {
    return this.knex('stock_requests')
        .join('products', 'stock_requests.product_id', 'products.id')
        .select('stock_requests.*', 'products.name as product_name')
        .orderBy('created_at', 'desc');
  }

  async notifyStockAvailable(productId: string, variantId?: string) {
    const query = this.knex('stock_requests')
        .where({ product_id: productId, status: 'pending' });
        
    if (variantId) {
        query.where({ variant_id: variantId });
    }

    const requests = await query;

    for (const req of requests) {
        const message = `Good news! The product you requested is back in stock. Order now!`;
        if (req.email) await this.notificationService.sendEmail(req.email, 'Product Back in Stock', message);
        await this.notificationService.sendSMS(req.phone, message);
        
        await this.knex('stock_requests').where({ id: req.id }).update({ status: 'notified' });
    }
  }

  // Product Requests
  async createProductRequest(data: CreateProductRequestDto) {
    const insertData = {
        product_name: data.productName,
        description: data.description,
        user_name: data.userName,
        phone: data.phone,
        email: data.email || null,
        status: 'pending'
    };

    const [request] = await this.knex('product_requests').insert(insertData).returning('*');
    
    const adminMessage = `New Product Request: ${data.productName}. Customer: ${data.userName} (${data.phone})`;
    await this.notificationService.sendEmail(process.env.ADMIN_EMAIL || 'admin@example.com', 'New Product Idea', adminMessage);

    return request;
  }

  async getProductRequests() {
    return this.knex('product_requests').orderBy('created_at', 'desc');
  }

  async updateProductRequestStatus(id: string, status: string) {
      const [request] = await this.knex('product_requests').where({ id }).update({ status }).returning('*');
      
      if (status === 'fulfilled') {
          const message = `Great news! The product "${request.product_name}" you requested is now available in our store.`;
          if (request.email) await this.notificationService.sendEmail(request.email, 'Product Request Fulfilled', message);
          await this.notificationService.sendSMS(request.phone, message);
      }
      
      return request;
  }

  // Contact Messages
  async sendContactMessage(data: { name: string; email: string; subject: string; message: string }) {
      // Save to DB
      await this.knex('contact_messages').insert({
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message
      });

      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
      const emailBody = `
        New Contact Message from ${data.name} (${data.email}):
        
        Subject: ${data.subject}
        
        Message:
        ${data.message}
      `;
      
      await this.notificationService.sendEmail(adminEmail, `Contact: ${data.subject}`, emailBody);
      
      // Auto-reply to user
      await this.notificationService.sendEmail(data.email, 'We received your message', `Hi ${data.name},\n\nThanks for reaching out. We have received your message and will get back to you shortly.\n\nBest,\nPrithibee Team`);
      
      return { success: true };
  }

  async getContactMessages() {
      return this.knex('contact_messages').orderBy('created_at', 'desc');
  }
}
