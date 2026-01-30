import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors();

  // ✅ Stable, environment-safe upload directory
  const uploadDir =
      process.env.NODE_ENV === 'production'
          ? '/var/www/uploads'
          : join(process.cwd(), 'uploads');

  // ✅ Ensure uploads directory exists
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  // Optional debug (remove later)
  console.log('CWD:', process.cwd());
  console.log('UPLOAD DIR:', uploadDir);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();