import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateStockRequestDto } from './dto/create-stock-request.dto';
import { CreateProductRequestDto } from './dto/create-product-request.dto';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post('stock')
  createStockRequest(@Body() dto: CreateStockRequestDto) {
    return this.requestsService.createStockRequest(dto);
  }

  @Get('stock')
  getStockRequests() {
    return this.requestsService.getStockRequests();
  }

  @Post('product')
  createProductRequest(@Body() dto: CreateProductRequestDto) {
    return this.requestsService.createProductRequest(dto);
  }

  @Get('product')
  getProductRequests() {
    return this.requestsService.getProductRequests();
  }

  @Put('product/:id/status')
  updateProductRequestStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.requestsService.updateProductRequestStatus(id, status);
  }

  @Post('contact')
  sendContactMessage(@Body() body: { name: string; email: string; subject: string; message: string }) {
      return this.requestsService.sendContactMessage(body);
  }

  @Get('contact')
  getContactMessages() {
      return this.requestsService.getContactMessages();
  }
}
