import { Module } from '@nestjs/common';
import { MotherCategoriesService } from './mother-categories.service';
import { MotherCategoriesController } from './mother-categories.controller';

@Module({
  controllers: [MotherCategoriesController],
  providers: [MotherCategoriesService],
  exports: [MotherCategoriesService],
})
export class MotherCategoriesModule {}
