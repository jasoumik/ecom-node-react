export class CreateCountryDto {
  name: string;
  name_bn?: string; // Added Bangla Name
  code: string;
  flag?: string;
  is_active?: boolean;
}
