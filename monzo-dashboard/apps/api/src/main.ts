import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log('Starting Monzo Dashboard API...', process.env.NODE_ENV);

  if (process.env.NODE_ENV === 'development') {
    console.log('Running in development mode, enabling CORS for frontend URL:', process.env.VITE_FRONTEND_URL);
    app.enableCors({
      origin: [process.env.VITE_FRONTEND_URL],
      credentials: true
    });
  }

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
