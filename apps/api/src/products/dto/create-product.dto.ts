export class CreateProductDto {
  name: string;
  description: string;
  price: number;
  old_price?: number;
  cost_price?: number;
  images: string[];
  category_id: string; // Changed from category string to category_id
  stock: number;
  sku?: string;
}
