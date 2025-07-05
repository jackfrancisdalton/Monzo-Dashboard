import { Module } from '@nestjs/common';
import { DashboardDataService } from './dashboard-data.service';
import { MonzoModule } from 'src/monzo/monzo.module';

@Module({
  imports: [MonzoModule],
  providers: [DashboardDataService],
  exports: [DashboardDataService],
})
export class DashboardDataModule {}
