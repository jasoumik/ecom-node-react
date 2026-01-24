import { CreateBannerDto } from './create-banner.dto';

export class UpdateBannerDto {
  title?: string;
  image?: string;
  link?: string;
  is_active?: boolean;
  order?: number;
}
