import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { MotherCategoriesService } from './mother-categories.service';

@Controller('mother-categories')
export class MotherCategoriesController {
  constructor(private readonly motherCategoriesService: MotherCategoriesService) {}

  @Get()
  findAll() {
    return this.motherCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.motherCategoriesService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.motherCategoriesService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.motherCategoriesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.motherCategoriesService.remove(id);
  }
}
