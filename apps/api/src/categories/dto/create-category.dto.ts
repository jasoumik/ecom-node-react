export class CreateCategoryDto {
  name: string;
  name_bn?: string;
  slug?: string; // Added Slug
  description?: string;
  description_bn?: string;
  image?: string;
  banner_image?: string;
  parent_id?: string;
  age_group_id?: string;
  is_active?: boolean;
}
