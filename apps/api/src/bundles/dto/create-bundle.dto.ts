export class CreateBundleItemDto {
  product_id: string;
  variant_id?: string;
  quantity: number;
}

export class CreateBundleDto {
  title: string;
  title_bn?: string;
  slug?: string; // Added Slug
  description?: string;
  description_bn?: string;
  image?: string;
  price: number;
  original_price?: number;
  is_free_shipping?: boolean;
  is_active?: boolean;
  items: CreateBundleItemDto[];
}
