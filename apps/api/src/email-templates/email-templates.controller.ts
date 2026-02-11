import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { EmailTemplatesService } from './email-templates.service';

@Controller('email-templates')
export class EmailTemplatesController {
  constructor(private readonly emailTemplatesService: EmailTemplatesService) {}

  @Get()
  findAll() {
    return this.emailTemplatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emailTemplatesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.emailTemplatesService.update(id, updateData);
  }
}
