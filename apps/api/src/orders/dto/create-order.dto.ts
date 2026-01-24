export class CreateOrderItemDto {
  productId: string;
  quantity: number;
}

export class CreateOrderDto {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: CreateOrderItemDto[];
  userId?: string;
  deliveryChargeId: string; // Required now
  couponCode?: string; // Optional
}
