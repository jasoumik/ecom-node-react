import { Controller, Get, Query } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('landing')
  getLandingPage(@Query('tenant') tenant: string) {
    return this.publicService.getLandingPageData(tenant);
  }

  @Get('landing/seo')
  getLandingSeo(@Query('tenant') tenant: string) {
    return this.publicService.getLandingSeoData(tenant);
  }
}
