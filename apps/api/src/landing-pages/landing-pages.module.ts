import { Module } from '@nestjs/common';
import { LandingPagesService } from './landing-pages.service';
import { LandingPagesController } from './landing-pages.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [LandingPagesController],
  providers: [LandingPagesService],
  exports: [LandingPagesService],
})
export class LandingPagesModule {}
