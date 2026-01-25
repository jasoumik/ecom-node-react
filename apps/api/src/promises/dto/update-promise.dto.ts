import { CreatePromiseDto } from './create-promise.dto';

export class UpdatePromiseDto {
  title?: string;
  description?: string;
  icon?: string;
  order?: number;
  is_active?: boolean;
}
