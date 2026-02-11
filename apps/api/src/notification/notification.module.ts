import { Module, Global } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EmailTemplatesModule } from '../email-templates/email-templates.module';

@Global()
@Module({
  imports: [EmailTemplatesModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
