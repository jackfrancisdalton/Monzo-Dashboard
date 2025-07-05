import { Controller, Get, Query } from '@nestjs/common';
import { DashboardQueryDto } from './dto/dashboard-dtos';
import { DashboardDataService } from './dashboard-data/dashboard-data.service';
import { DashboardSummary } from '@repo/chart-data-types';

@Controller()
export class AppController {
  constructor(
    private readonly dashboardService: DashboardDataService
  ) {}

  @Get()
  async getDashBoard(@Query() query: DashboardQueryDto): Promise<DashboardSummary> {
    const { start, end } = query;
    return this.dashboardService.getDashboardData(start, end);
  }
}
