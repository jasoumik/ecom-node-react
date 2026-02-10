import { CreateProductDto, CreateVariantDto } from './create-product.dto';

export class UpdateProductDto {
  name?: string;
  name_bn?: string;
  slug?: string; // Added Slug
  description?: string;
  description_bn?: string;
  price?: number;
  old_price?: number;
  cost_price?: number;
  images?: string[];
  category_id?: string;
  brand_id?: string;
  country_id?: string;
  stock?: number;
  sku?: string;
  size?: string;
  weight?: string;
  color?: string;
  material?: string;
  
  has_variants?: boolean;
  variants?: CreateVariantDto[];
  is_active?: boolean;
}
