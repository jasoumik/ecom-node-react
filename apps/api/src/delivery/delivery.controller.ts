import { Controller, Get, Post, Body } from '@nestjs/common';
import { DeliveryService } from './delivery.service';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get()
  findAll() {
    return this.deliveryService.findAll();
  }

  @Post()
  create(@Body() data: any) {
    return this.deliveryService.create(data);
  }
}
