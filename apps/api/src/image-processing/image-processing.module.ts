import { Module } from '@nestjs/common';
import { ImageProcessingService } from './image-processing.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [ImageProcessingService],
  exports: [ImageProcessingService],
})
export class ImageProcessingModule {}
