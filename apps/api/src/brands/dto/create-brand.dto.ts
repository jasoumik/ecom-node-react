export class CreateBrandDto {
  name: string;
  name_bn?: string; // Added Bangla Name
  logo?: string;
  description?: string;
  is_active?: boolean;
}
