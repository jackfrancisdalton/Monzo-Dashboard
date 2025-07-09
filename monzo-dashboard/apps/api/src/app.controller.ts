import { Controller, Get, Query } from '@nestjs/common';
import { DashboardDataService } from './dashboard-data/dashboard-data.service';
import { DashboardSummary } from '../../../packages/dashboard-types/src';
import { DashboardQueryDto } from './dashboard-data/dto/dashboard-dtos';
import { MonzoSyncService } from './monzo/monzo-sync.service';

@Controller()
export class AppController {
  constructor(
    private readonly dashboardService: DashboardDataService,
    private readonly monzoSyncService: MonzoSyncService,
  ) {}

  @Get()
  async getDashBoard(@Query() query: DashboardQueryDto): Promise<DashboardSummary> {
    const { start, end } = query;
    return this.dashboardService.getDashboardData(start, end);
  }


  @Get('test')
  async testEndpoint(): Promise<string> {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    this.monzoSyncService.testSync(fiveDaysAgo, (progress) => {
      console.log('Sync Progress:', progress);
    });
    
    return 'Sync started, check console for progress updates.';
  }
}
