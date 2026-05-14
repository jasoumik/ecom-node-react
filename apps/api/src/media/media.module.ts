import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { ImageProcessingModule } from '../image-processing/image-processing.module';

@Module({
  imports: [ImageProcessingModule],
  providers: [MediaService],
  controllers: [MediaController],
})
export class MediaModule {}
