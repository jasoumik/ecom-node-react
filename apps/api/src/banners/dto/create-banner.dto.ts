export class CreateBannerDto {
  title: string;
  title_bn?: string; // Added Bangla Title
  image: string;
  link?: string;
  order?: number;
  is_active?: boolean;
}
