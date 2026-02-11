import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  generateInvoiceHtml(order: any): string {
    const itemsHtml = order.items.map((item: any, index: number) => `
      <tr>
        <td>
          <div style="font-weight: 500; color: #333;">${item.product_name}</div>
          ${item.variant_name ? `<div style="font-size: 12px; color: #888; margin-top: 2px;">Variant: ${item.variant_name}</div>` : ''}
        </td>
        <td class="text-center">${item.quantity}</td>
        <td class="text-right">${parseFloat(item.price).toFixed(2)}</td>
        <td class="text-right" style="font-weight: 500;">${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice #${order.order_number}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #4b5563;
            margin: 0;
            padding: 0;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
          }
          .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 40px;
            font-size: 14px;
            background: #fff;
          }
          .header-table {
            width: 100%;
            margin-bottom: 40px;
          }
          .header-table td {
            vertical-align: top;
          }
          .company-info {
            text-align: right;
          }
          .company-name {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 5px;
            letter-spacing: -0.5px;
          }
          .invoice-title {
            font-size: 32px;
            font-weight: 800;
            color: #111827;
            margin: 0 0 10px 0;
            letter-spacing: -1px;
          }
          .invoice-meta {
            margin-top: 5px;
            color: #6b7280;
          }
          .invoice-meta strong {
            color: #374151;
            font-weight: 600;
          }
          .section-title {
            font-size: 11px;
            font-weight: 600;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          .address-box {
            margin-bottom: 40px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
            border: 1px solid #f3f4f6;
          }
          .customer-name {
            font-weight: 600;
            color: #111827;
            font-size: 16px;
            margin-bottom: 4px;
          }
          .items-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 40px;
          }
          .items-table th {
            padding: 12px 16px;
            background: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
            border-top: 1px solid #e5e7eb;
            text-align: left;
            font-weight: 600;
            color: #374151;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .items-table th:first-child { border-top-left-radius: 6px; border-bottom-left-radius: 6px; border-left: 1px solid #e5e7eb; }
          .items-table th:last-child { border-top-right-radius: 6px; border-bottom-right-radius: 6px; border-right: 1px solid #e5e7eb; }
          
          .items-table td {
            padding: 16px;
            border-bottom: 1px solid #f3f4f6;
            vertical-align: middle;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          
          .totals-container {
            display: flex;
            justify-content: flex-end;
          }
          .totals-table {
            width: 300px;
            border-collapse: collapse;
          }
          .totals-table td {
            padding: 8px 0;
            text-align: right;
          }
          .totals-table .label {
            color: #6b7280;
            padding-right: 20px;
          }
          .totals-table .value {
            color: #111827;
            font-weight: 500;
          }
          .totals-table .grand-total-row td {
            padding-top: 15px;
            border-top: 2px solid #e5e7eb;
            margin-top: 10px;
          }
          .totals-table .grand-total {
            font-size: 20px;
            font-weight: 700;
            color: #111827;
          }
          .footer {
            margin-top: 60px;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            background: #e5e7eb;
            color: #374151;
            margin-top: 5px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <table class="header-table">
            <tr>
              <td>
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-meta">
                  <div><strong>Invoice #:</strong> ${order.order_number}</div>
                  <div><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</div>
                  <div class="status-badge">${order.payment_status || 'Pending'}</div>
                </div>
              </td>
              <td class="company-info">
                <div class="company-name" style="color: #1a9de2;">Prithibee.com</div>
                <div>Uttara Model Town, Uttara</div>
                <div>Dhaka-1230, Bangladesh</div>
                <div>+880 1616-684803</div>
                <div style="color: #2563eb;">support@prithibee.com</div>
              </td>
            </tr>
          </table>

          <div class="address-box">
            <div class="section-title">Bill To</div>
            <div class="customer-name">${order.customer_name}</div>
            <div>${order.customer_phone}</div>
            <div style="max-width: 400px; margin-top: 4px; line-height: 1.4;">${order.customer_address}</div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 50%;">Item Description</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals-container">
            <table class="totals-table">
              <tr>
                <td class="label">Subtotal</td>
                <td class="value">${parseFloat(order.subtotal).toFixed(2)}</td>
              </tr>
              <tr>
                <td class="label">Delivery</td>
                <td class="value">${parseFloat(order.delivery_charge).toFixed(2)}</td>
              </tr>
              ${parseFloat(order.discount) > 0 ? `
              <tr>
                <td class="label">Discount</td>
                <td class="value" style="color: #ef4444;">-${parseFloat(order.discount).toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr class="grand-total-row">
                <td class="label" style="padding-top: 15px;">Total</td>
                <td class="value grand-total">${parseFloat(order.total_amount).toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="footer">
            <p>Thank you for shopping with Prithibee!</p>
            <p>If you have any questions about this invoice, please contact us at support@prithibee.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async generateInvoicePdf(order: any): Promise<Buffer> {
    const html = this.generateInvoiceHtml(order);
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });
      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error('Failed to generate PDF invoice', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
