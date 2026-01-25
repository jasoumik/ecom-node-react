import { CreateCountryDto } from './create-country.dto';

export class UpdateCountryDto {
  name?: string;
  code?: string;
  flag?: string;
  is_active?: boolean;
}
