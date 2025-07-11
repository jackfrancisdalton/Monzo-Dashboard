import { Controller, Get, Query } from '@nestjs/common';
import { DashboardDataService } from './dashboard-data/dashboard-data.service';
import { AccountsSummary, DashboardSummary } from '../../../packages/dashboard-types/src';
import { DashboardQueryDto } from './dashboard-data/dto/dashboard-dtos';

// TODO: move this to data dashboard module
@Controller()
export class AppController {
  constructor(
    private readonly dashboardService: DashboardDataService,
  ) {}

  @Get()
  async getDashBoard(@Query() query: DashboardQueryDto): Promise<DashboardSummary> {
    const { accountId, start, end } = query;
    return this.dashboardService.getDashboardData(accountId, start, end);
  }

  @Get("/accounts")
  async getAccounts(): Promise<AccountsSummary> {
    return await this.dashboardService.getAccounts();
  }

  @Get('is-configured')
  async isConfigured(): Promise<{ isConfigured: boolean }> {
    const isConfigured = await this.dashboardService.isConfigured();
    return { isConfigured };
  }
}
