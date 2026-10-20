import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
