import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MonzoModule } from './monzo/monzo.module';

@Module({
  imports: [MonzoModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
