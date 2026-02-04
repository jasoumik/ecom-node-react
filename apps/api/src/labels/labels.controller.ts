import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { LabelsService } from './labels.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';

@Controller('labels')
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Get()
  findAll(@Query('all') all?: string) {
    const includeInactive = all === 'true';
    return this.labelsService.findAll(includeInactive);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.labelsService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.labelsService.findBySlug(slug);
  }

  @Get(':id/products')
  getProductsByLabel(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.labelsService.getProductsByLabel(
      id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post()
  create(@Body() createLabelDto: CreateLabelDto) {
    return this.labelsService.create(createLabelDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateLabelDto: UpdateLabelDto) {
    return this.labelsService.update(id, updateLabelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.labelsService.remove(id);
  }

  @Post('products/:productId')
  assignLabelsToProduct(
    @Param('productId') productId: string,
    @Body() body: { labelIds: string[] },
  ) {
    return this.labelsService.assignLabelsToProduct(productId, body.labelIds);
  }

  @Get('products/:productId/labels')
  getProductLabels(@Param('productId') productId: string) {
    return this.labelsService.getProductLabels(productId);
  }
}

