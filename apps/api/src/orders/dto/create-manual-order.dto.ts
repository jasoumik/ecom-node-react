import { CreateOrderItemDto } from './create-order.dto';

export class CreateManualOrderDto {
  orderSource: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: CreateOrderItemDto[];
  discount?: number;
  deliveryCharge: number;
  paymentMethod: string;
  paymentStatus: string;
  paidAmount?: number; // Added for partial payment
  transactionId?: string; // Added for payment tracking
  status: string;
}
