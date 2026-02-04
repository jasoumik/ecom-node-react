import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  findAll(@Query('all') all?: string) {
    const includeInactive = all === 'true';
    return this.couponsService.findAll(includeInactive);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Get(':id/stats')
  getUsageStats(@Param('id') id: string) {
    return this.couponsService.getUsageStats(id);
  }

  @Post()
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponsService.create(createCouponDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponsService.update(id, updateCouponDto);
  }

  @Post('validate')
  validate(@Body() body: {
    code: string;
    amount: number;
    userId?: string;
    productIds?: string[];
    categoryIds?: string[];
  }) {
    return this.couponsService.validate(
      body.code,
      body.amount,
      body.userId,
      body.productIds,
      body.categoryIds
    );
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.couponsService.delete(id);
  }
}

