import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  old_price?: number;
  cost_price?: number;
  images?: string[];
  category_id?: string;
  stock?: number;
  sku?: string;
}
