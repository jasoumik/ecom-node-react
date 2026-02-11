import { Module, Global } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EmailTemplatesModule } from '../email-templates/email-templates.module';
import { SmsTemplatesModule } from '../sms-templates/sms-templates.module';

@Global()
@Module({
  imports: [EmailTemplatesModule, SmsTemplatesModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
