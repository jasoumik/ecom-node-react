export class CreatePromiseDto {
  title: string;
  title_bn?: string; // Added Bangla Title
  description: string;
  description_bn?: string; // Added Bangla Description
  icon: string;
  order?: number;
  is_active?: boolean;
}
