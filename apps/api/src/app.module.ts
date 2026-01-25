import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PublicModule } from './public/public.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { BannersModule } from './banners/banners.module';
import { MediaModule } from './media/media.module';
import { CouponsModule } from './coupons/coupons.module';
import { DeliveryModule } from './delivery/delivery.module';
import { BrandsModule } from './brands/brands.module';
import { SettingsModule } from './settings/settings.module';
import { CountriesModule } from './countries/countries.module';
import { NotificationModule } from './notification/notification.module';
import { RequestsModule } from './requests/requests.module'; // Added RequestsModule
import { DatabaseModule } from './database/database.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    DatabaseModule,
    PublicModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    AuthModule,
    OrdersModule,
    DashboardModule,
    BannersModule,
    MediaModule,
    CouponsModule,
    DeliveryModule,
    BrandsModule,
    SettingsModule,
    CountriesModule,
    NotificationModule,
    RequestsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
