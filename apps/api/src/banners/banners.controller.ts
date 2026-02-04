import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  findAll(@Query('all') all?: string) {
    const includeInactive = all === 'true';
    return this.bannersService.findAll(includeInactive);
  }

  @Get('position/:position')
  findByPosition(@Param('position') position: string) {
    return this.bannersService.findByPosition(position);
  }

  @Get('label/:labelId')
  findByLabel(@Param('labelId') labelId: string) {
    return this.bannersService.findByLabel(labelId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bannersService.findOne(id);
  }

  @Post()
  create(@Body() createBannerDto: CreateBannerDto) {
    return this.bannersService.create(createBannerDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto) {
    return this.bannersService.update(id, updateBannerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }
}
