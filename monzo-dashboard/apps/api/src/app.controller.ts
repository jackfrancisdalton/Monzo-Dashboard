import { Controller, Get, Query } from '@nestjs/common';
import { DashboardDataService } from './dashboard-data/dashboard-data.service';
import { DashboardSummary } from '../../../packages/dashboard-types/src';
import { DashboardQueryDto } from './dashboard-data/dto/dashboard-dtos';

@Controller()
export class AppController {
  constructor(
    private readonly dashboardService: DashboardDataService,
  ) {}

  @Get()
  async getDashBoard(@Query() query: DashboardQueryDto): Promise<DashboardSummary> {
    const { start, end } = query;
    return this.dashboardService.getDashboardData(start, end);
  }
}
