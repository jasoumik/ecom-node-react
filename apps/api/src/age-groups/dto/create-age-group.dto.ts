import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateAgeGroupDto {
  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  label_bn?: string;

  @IsString()
  icon: string;

  @IsString()
  age_range: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  description_bn?: string;

  @IsOptional()
  @IsNumber()
  sort_order?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

