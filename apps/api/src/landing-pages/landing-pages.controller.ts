import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { LandingPagesService } from './landing-pages.service';

@Controller('landing-pages')
export class LandingPagesController {
  constructor(private readonly landingPagesService: LandingPagesService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.landingPagesService.create(createDto);
  }

  @Get()
  findAll() {
    return this.landingPagesService.findAll();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.landingPagesService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.landingPagesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.landingPagesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.landingPagesService.remove(id);
  }
}
