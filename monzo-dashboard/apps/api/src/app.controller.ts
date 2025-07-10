import { Controller, Get, Query } from '@nestjs/common';
import { DashboardDataService } from './dashboard-data/dashboard-data.service';
import { DashboardSummary } from '../../../packages/dashboard-types/src';
import { DashboardQueryDto } from './dashboard-data/dto/dashboard-dtos';
import { MonzoSyncService } from './monzo/monzo-sync.service';
import { Observable } from 'rxjs';

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

  @Get('is-configured')
  async isConfigured(): Promise<{ isConfigured: boolean }> {
    const isConfigured = await this.dashboardService.isConfigured();

    return { isConfigured };
  }

  // @Sse('sync')
  // sync(): Observable<MessageEvent> {
  //   return new Observable((subscriber) => {
  //     this.syncService.initialFullFetch((progress) => {
  //       subscriber.next({ data: progress });
  //     })
  //     .then(() => {
  //       subscriber.complete();
  //     })
  //     .catch((err) => {
  //       subscriber.error(err);
  //     });
  //   });
  // }
}
