import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto {
  name?: string;
  description?: string;
  image?: string;
  parent_id?: string;
}
