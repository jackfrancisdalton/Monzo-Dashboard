import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MonzoModule } from './monzo/monzo.module';
import { DashboardDataModule } from './dashboard-data/dashboard-data.module';

@Module({
  imports: [MonzoModule, DashboardDataModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
