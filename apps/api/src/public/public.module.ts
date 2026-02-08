import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsModule } from '../products/products.module';
import { MotherCategoriesModule } from '../mother-categories/mother-categories.module';

@Module({
  imports: [CategoriesModule, ProductsModule, MotherCategoriesModule],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
