export class CreateProductDto {
  name: string;
  description: string;
  price: number;
  old_price?: number;
  cost_price?: number;
  images: string[];
  category_id: string;
  brand_id?: string; // Optional
  stock: number;
  sku?: string;
}
