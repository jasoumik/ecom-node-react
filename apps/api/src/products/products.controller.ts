import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('category') categoryId?: string,
    @Query('search') search?: string,
    @Query('brand') brandId?: string,
    @Query('age') ageId?: string,
    @Query('sort') sort?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number
  ) {
    return this.productsService.findAll(Number(page), Number(limit), categoryId, search, brandId, ageId, sort, minPrice, maxPrice);
  }

  @Get('batches')
  async getAllBatches(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 20
  ) {
      return this.productsService.getAllBatches(Number(page), Number(limit));
  }

  @Get('stock-movements')
  async getStockMovements(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 20,
      @Query('productId') productId?: string
  ) {
      return this.productsService.getStockMovements(Number(page), Number(limit), productId);
  }

  @Post('adjust-stock')
  adjustStock(@Body() adjustStockDto: AdjustStockDto) {
      return this.productsService.adjustStock(adjustStockDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post(':id/batches')
  addBatch(@Param('id') id: string, @Body() batchData: any) {
    return this.productsService.addBatch(id, batchData);
  }

  @Delete('batches/:id')
  deleteBatch(@Param('id') id: string) {
      return this.productsService.deleteBatch(id);
  }
}
