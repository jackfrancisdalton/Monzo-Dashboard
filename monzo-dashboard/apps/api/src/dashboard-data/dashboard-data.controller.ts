import { Controller, Get, Query } from '@nestjs/common';
import { DashboardDataService } from './dashboard-data.service';
import { AccountsSummary, DashboardSummary } from "@repo/dashboard-types";
import { DashboardQueryDto } from './dto/dashboard-dtos';

@Controller('dashboard-data')
export class DashboardDataController {
  constructor(
    private readonly dashboardService: DashboardDataService,
  ) {}

  @Get('data')
  async getDashBoard(@Query() query: DashboardQueryDto): Promise<DashboardSummary> {
    const { accountId, start, end } = query;
    return this.dashboardService.getDashboardData(accountId, start, end);
  }

  @Get("accounts")
  async getAccounts(): Promise<AccountsSummary> {
    return await this.dashboardService.getAccounts();
  }

  @Get('is-configured')
  async isConfigured(): Promise<{ isConfigured: boolean }> {
    const isConfigured = await this.dashboardService.isConfigured();
    return { isConfigured };
  }
}
