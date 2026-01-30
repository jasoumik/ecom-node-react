import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// ✅ Absolute path for uploads
const UPLOADS_PATH =
    process.env.NODE_ENV === 'production'
        ? '/var/www/uploads'
        : join(process.cwd(), 'uploads');

// ✅ Ensure uploads folder exists
if (!existsSync(UPLOADS_PATH)) {
  mkdirSync(UPLOADS_PATH, { recursive: true });
}

@Module({
  imports: [
    MulterModule.register({
      dest: UPLOADS_PATH, // ✅ Absolute path, same everywhere
    }),
  ],
  providers: [MediaService],
  controllers: [MediaController],
})
export class MediaModule {}