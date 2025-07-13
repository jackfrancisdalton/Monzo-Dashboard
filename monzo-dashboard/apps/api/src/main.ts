import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  // TODO: review changing this to fail if port not defined instead of defaulting to 3000
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
