export class CreateCategoryDto {
  name: string;
  name_bn?: string; // Added Bangla Name
  description?: string;
  description_bn?: string; // Added Bangla Description
  image?: string;
  parent_id?: string;
  is_active?: boolean;
}
