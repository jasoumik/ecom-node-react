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
import { CouponsModule } from './coupons/coupons.module';
import { DeliveryModule } from './delivery/delivery.module';
import { BrandsModule } from './brands/brands.module';
import { SettingsModule } from './settings/settings.module';
import { CountriesModule } from './countries/countries.module';
import { NotificationModule } from './notification/notification.module';
import { RequestsModule } from './requests/requests.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PromisesModule } from './promises/promises.module';
import { LandingPagesModule } from './landing-pages/landing-pages.module'; // Added
import { DatabaseModule } from './database/database.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { existsSync, mkdirSync } from 'fs';
import { MediaModule } from './media/media.module';
// ... other imports

// ✅ Absolute path for uploads
export const UPLOADS_PATH =
    process.env.NODE_ENV === 'production'
        ? '/var/www/uploads'
        : join(process.cwd(), 'uploads');

// ✅ Ensure folder exists
if (!existsSync(UPLOADS_PATH)) {
  mkdirSync(UPLOADS_PATH, { recursive: true });
}

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
    ReviewsModule,
    PromisesModule,
    LandingPagesModule,
    ServeStaticModule.forRoot({
      rootPath: UPLOADS_PATH, // ✅ Use absolute path
      serveRoot: '/uploads',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}