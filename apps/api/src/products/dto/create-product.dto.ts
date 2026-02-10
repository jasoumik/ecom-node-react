export class CreateVariantDto {
  size?: string;
  color?: string;
  material?: string;
  weight?: string;
  price?: number;
  stock: number;
  sku?: string;
}

export class CreateProductDto {
  name: string;
  name_bn?: string; // Added Bangla Name
  slug?: string; // Added Slug
  description: string;
  description_bn?: string; // Added Bangla Description
  price: number;
  old_price?: number;
  cost_price?: number;
  images: string[];
  category_id: string;
  brand_id?: string;
  country_id?: string;
  stock: number;
  sku?: string;
  size?: string;
  weight?: string;
  color?: string;
  material?: string;
  
  has_variants?: boolean;
  variants?: CreateVariantDto[];
  is_active?: boolean;
  age_groups?: string[]; // Added Age Groups
}
