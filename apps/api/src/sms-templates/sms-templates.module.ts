import { Module } from '@nestjs/common';
import { SmsTemplatesService } from './sms-templates.service';
import { SmsTemplatesController } from './sms-templates.controller';

@Module({
  controllers: [SmsTemplatesController],
  providers: [SmsTemplatesService],
  exports: [SmsTemplatesService],
})
export class SmsTemplatesModule {}
