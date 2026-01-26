import { CreateBrandDto } from './create-brand.dto';

export class UpdateBrandDto {
  name?: string;
  name_bn?: string; // Added Bangla Name
  logo?: string;
  description?: string;
  is_active?: boolean;
}
