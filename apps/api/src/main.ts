import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api'); // Restored global prefix
  app.enableCors();
  
  // Ensure uploads directory exists
  const fs = require('fs');
  const uploadDir = './uploads';
  if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir);
  }
  
  // Serve static files manually if ServeStaticModule has issues with prefix
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
