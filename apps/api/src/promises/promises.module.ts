import { Module } from '@nestjs/common';
import { PromisesService } from './promises.service';
import { PromisesController } from './promises.controller';

@Module({
  providers: [PromisesService],
  controllers: [PromisesController],
  exports: [PromisesService],
})
export class PromisesModule {}
