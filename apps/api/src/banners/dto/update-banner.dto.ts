import { CreateBannerDto } from './create-banner.dto';

export class UpdateBannerDto {
  title?: string;
  title_bn?: string; // Added Bangla Title
  image?: string;
  link?: string;
  order?: number;
  is_active?: boolean;
}
