import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { CouponsService } from './coupons.service';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  findAll() {
    return this.couponsService.findAll();
  }

  @Post()
  create(@Body() data: any) {
    return this.couponsService.create(data);
  }

  @Post('validate')
  validate(@Body() body: { code: string; amount: number }) {
    return this.couponsService.validate(body.code, body.amount);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.couponsService.delete(id);
  }
}
