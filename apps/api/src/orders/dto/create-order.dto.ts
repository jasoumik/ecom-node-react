export class CreateOrderItemDto {
  productId: string;
  quantity: number;
}

export class CreateOrderDto {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: CreateOrderItemDto[];
  userId?: string; // Optional, if logged in
}
