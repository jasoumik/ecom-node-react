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
import { RequestsModule } from './requests/requests.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PromisesModule } from './promises/promises.module';
import { LandingPagesModule } from './landing-pages/landing-pages.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { AgeGroupsModule } from './age-groups/age-groups.module';
import { LabelsModule } from './labels/labels.module';
import { BundlesModule } from './bundles/bundles.module';
import { MotherCategoriesModule } from './mother-categories/mother-categories.module';
import { EmailModule } from './email/email.module';
import { EmailTemplatesModule } from './email-templates/email-templates.module';
import { SmsTemplatesModule } from './sms-templates/sms-templates.module';
import { DatabaseModule } from './database/database.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    DatabaseModule,
    EmailModule,
    EmailTemplatesModule,
    SmsTemplatesModule, // Added SmsTemplatesModule
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
    WishlistModule,
    AgeGroupsModule,
    LabelsModule,
    BundlesModule,
    MotherCategoriesModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
