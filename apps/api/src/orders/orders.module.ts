import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { DatabaseModule } from '../database/database.module';
import { NotificationModule } from '../notification/notification.module';
import { SettingsModule } from '../settings/settings.module'; // Import SettingsModule

@Module({
  imports: [DatabaseModule, NotificationModule, SettingsModule], // Add SettingsModule
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
