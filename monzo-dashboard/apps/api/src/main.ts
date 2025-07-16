import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(['log', 'warn', 'error']);

  if (process.env.NODE_ENV === 'development') {
    // Required to communicate between frontend when running on localhost ports
    app.enableCors({
      origin: [process.env.VITE_FRONTEND_URL],
      credentials: true
    });
  }

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  const port = process.env.API_PORT;
  
  if (!port) {
    throw new Error('API_DOCKER_PORT is not defined');
  }

  await app.listen(port);
}
bootstrap();
