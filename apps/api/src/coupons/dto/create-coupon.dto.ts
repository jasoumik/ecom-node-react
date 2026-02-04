import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsDateString } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  type: 'percentage' | 'fixed';

  @IsNumber()
  value: number;

  @IsOptional()
  @IsNumber()
  min_order_amount?: number;

  @IsOptional()
  @IsNumber()
  max_discount_amount?: number;

  @IsOptional()
  @IsDateString()
  starts_at?: string;

  @IsOptional()
  @IsDateString()
  expires_at?: string;

  @IsOptional()
  @IsBoolean()
  no_expiry?: boolean;

  @IsOptional()
  @IsNumber()
  usage_limit?: number;

  @IsOptional()
  @IsNumber()
  usage_limit_per_user?: number;

  @IsOptional()
  @IsArray()
  applicable_categories?: string[];

  @IsOptional()
  @IsArray()
  applicable_products?: string[];

  @IsOptional()
  @IsArray()
  excluded_products?: string[];

  @IsOptional()
  @IsBoolean()
  first_order_only?: boolean;

  @IsOptional()
  @IsBoolean()
  free_shipping?: boolean;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

