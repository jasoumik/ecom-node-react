export class CreateOrderItemDto {
  productId: string;
  variantId?: string; // Added variantId
  quantity: number;
}

export class CreateOrderDto {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: CreateOrderItemDto[];
  userId?: string;
  deliveryChargeId: string;
  couponCode?: string;
  paymentMethod: string;
  transactionId?: string;
}
