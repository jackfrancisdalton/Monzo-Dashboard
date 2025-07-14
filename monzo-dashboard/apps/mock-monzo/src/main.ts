import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.MOCK_MONZO_PORT;

  if (!port) {
    throw new Error('MOCK_MONZO_PORT environment variable is not set. Please set it in your .env file or environment variables.');
  }

  await app.listen(port);
}
bootstrap();
