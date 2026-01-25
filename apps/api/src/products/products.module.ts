import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { SettingsModule } from '../settings/settings.module';
import { RequestsModule } from '../requests/requests.module'; // Import RequestsModule

@Module({
  imports: [SettingsModule, RequestsModule],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
