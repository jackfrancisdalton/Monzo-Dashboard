import { Module } from '@nestjs/common';
import { DashboardDataService } from './dashboard-data.service';
import { MonzoModule } from 'src/monzo/monzo.module';
import { DashboardDataController } from './dashboard-data.controller';

@Module({
  imports: [MonzoModule],
  providers: [DashboardDataService],
  controllers: [DashboardDataController],
  exports: [DashboardDataService],
})
export class DashboardDataModule {}
