import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested, IsUUID, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsUUID()
  variantId?: string;

  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @IsString()
  customerName: string;

  @IsString()
  @Matches(/^(01[3-9]\d{8}|\+8801[3-9]\d{8})$/, { message: 'customerPhone must be a valid Bangladeshi phone number' })
  customerPhone: string;

  @IsString()
  customerAddress: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsUUID()
  deliveryChargeId: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(01[3-9]\d{8}|\+8801[3-9]\d{8})$/, { message: 'paymentPhone must be a valid Bangladeshi phone number' })
  paymentPhone?: string; // Added payment phone

  @IsOptional()
  @IsBoolean()
  isGift?: boolean;

  @IsOptional()
  @IsString()
  giftMessage?: string;

  @IsOptional()
  @IsNumber()
  redeemPoints?: number;
}
