import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MonzoModule } from './monzo/monzo.module';

@Module({
  imports: [MonzoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
