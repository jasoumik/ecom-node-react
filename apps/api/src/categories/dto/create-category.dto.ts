export class CreateCategoryDto {
  name: string;
  name_bn?: string;
  description?: string;
  description_bn?: string;
  image?: string;
  banner_image?: string; // Added Banner Image
  parent_id?: string;
  age_group_id?: string; // Shop by Age Group
  is_active?: boolean;
}
