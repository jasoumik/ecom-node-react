import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto {
  name?: string;
  name_bn?: string;
  description?: string;
  description_bn?: string;
  image?: string;
  parent_id?: string;
  is_active?: boolean;
}
