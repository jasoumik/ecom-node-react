export class CreateBrandDto {
  name: string;
  name_bn?: string; // Added Bangla Name
  slug?: string; // Added Slug
  logo?: string;
  description?: string;
  is_active?: boolean;
}
