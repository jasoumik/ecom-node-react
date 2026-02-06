import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { BundlesService } from './bundles.service';
import { CreateBundleDto } from './dto/create-bundle.dto';
import { UpdateBundleDto } from './dto/update-bundle.dto';

@Controller('bundles')
export class BundlesController {
  constructor(private readonly bundlesService: BundlesService) {}

  @Get()
  findAll(@Query('public') publicOnly?: string) {
    return this.bundlesService.findAll(publicOnly === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bundlesService.findOne(id);
  }

  @Post()
  create(@Body() createBundleDto: CreateBundleDto) {
    return this.bundlesService.create(createBundleDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateBundleDto: UpdateBundleDto) {
    return this.bundlesService.update(id, updateBundleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bundlesService.remove(id);
  }
}
