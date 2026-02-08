import { IsString, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class AdjustStockDto {
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsUUID()
  variantId?: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  type: 'wastage' | 'broken' | 'offline_sale' | 'correction_add' | 'correction_remove';

  @IsOptional()
  @IsString()
  reason?: string;
}
