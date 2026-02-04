import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateLabelDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  name_bn?: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  bg_color?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

