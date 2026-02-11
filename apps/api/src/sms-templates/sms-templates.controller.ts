import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { SmsTemplatesService } from './sms-templates.service';

@Controller('sms-templates')
export class SmsTemplatesController {
  constructor(private readonly smsTemplatesService: SmsTemplatesService) {}

  @Get()
  findAll() {
    return this.smsTemplatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.smsTemplatesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.smsTemplatesService.update(id, updateData);
  }
}
