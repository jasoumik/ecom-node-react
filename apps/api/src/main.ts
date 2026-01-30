import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ------------------------------
  // GLOBAL PREFIX
  // ------------------------------
  app.setGlobalPrefix('api');

  // ------------------------------
  // UPLOADS FOLDER (absolute path)
  // ------------------------------
  const UPLOADS_PATH =
      process.env.NODE_ENV === 'production'
          ? '/var/www/uploads'               // Production folder
          : join(process.cwd(), 'uploads');  // Dev folder

  if (!existsSync(UPLOADS_PATH)) {
    mkdirSync(UPLOADS_PATH, { recursive: true });
  }

  // ------------------------------
  // CORS CONFIGURATION
  // ------------------------------
  const allowedOrigins = [
    'https://prithibee.com',   // production frontend
    'http://localhost:3000',   // dev frontend
  ];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: true,  // if you use cookies or JWT
  });

  // ------------------------------
  // SERVE STATIC UPLOADS (optional, can also be in AppModule)
  // ------------------------------
  // If you want, you can move this to AppModule via ServeStaticModule.forRoot
  // app.useStaticAssets(UPLOADS_PATH, { prefix: '/uploads/' });

  // ------------------------------
  // START SERVER
  // ------------------------------
  const port = process.env.PORT ?? 3000;
  await app.listen(port, () => {
    console.log(`🚀 API running on port ${port}`);
    console.log(`📁 Uploads folder: ${UPLOADS_PATH}`);
  });
}

bootstrap();