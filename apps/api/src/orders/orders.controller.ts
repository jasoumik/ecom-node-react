import { Controller, Get, Post, Body, Param, Put, UseGuards, Request, Query, Delete } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateManualOrderDto } from './dto/create-manual-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Post('manual')
  createManual(@Body() createManualOrderDto: CreateManualOrderDto) {
    return this.ordersService.createManual(createManualOrderDto);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    return this.ordersService.findAll(search);
  }

  @Get('my-orders')
  findMyOrders(@Query('userId') userId: string) {
    return this.ordersService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Put(':id/status')
  updateStatus(
      @Param('id') id: string, 
      @Body('status') status: string,
      @Body('comment') comment?: string,
      @Body('userId') userId?: string
  ) {
    return this.ordersService.updateStatus(id, status, comment, userId);
  }

  @Put(':id/cancel')
  cancelOrder(@Param('id') id: string, @Body('userId') userId: string) {
    return this.ordersService.cancelOrder(id, userId);
  }

  @Post(':id/payments')
  addPayment(
      @Param('id') id: string,
      @Body('amount') amount: number,
      @Body('method') method: string,
      @Body('transactionId') transactionId?: string,
      @Body('note') note?: string
  ) {
      return this.ordersService.addPayment(id, amount, method, transactionId, note);
  }
}
