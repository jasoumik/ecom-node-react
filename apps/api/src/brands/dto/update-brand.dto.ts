import { CreateBrandDto } from './create-brand.dto';

export class UpdateBrandDto {
  name?: string;
  name_bn?: string; // Added Bangla Name
  slug?: string; // Added Slug
  logo?: string;
  description?: string;
  is_active?: boolean;
}
