import { Injectable, Logger } from '@nestjs/common';
import type { MonzoAccount, MonzoBalance, MonzoTransaction } from '@repo/monzo-types';
import { MonzoService } from './monzo-service.interface';
import { HttpService } from '@nestjs/axios';
import { map, catchError } from 'rxjs/operators';
import { firstValueFrom, throwError } from 'rxjs';

@Injectable()
export class MockMonzoService implements MonzoService {
  private readonly logger = new Logger(MockMonzoService.name);

  constructor(private readonly http: HttpService) {}

  async isConfigured(): Promise<boolean> {
    this.logger.log('Running monzo configuration check')
    // No Oauth required for mock service so we considered it always configured.
    return true;
  }

  async hasSomeData(): Promise<boolean> {
    this.logger.log('Checking if some data has already been synced')
    // Assumed we always have some data in the mock service.
    return true;
  }

  async getAccounts(): Promise<MonzoAccount[]> {
    this.logger.log('Fetching account data')
    return this.getRequest<MonzoAccount[]>(`${process.env.MOCK_MONZO_URL}/accounts`);
  }

  async getBalance(accountId: string): Promise<MonzoBalance> {
    this.logger.log('Fetching balance data')
    return this.getRequest<MonzoBalance>(`${process.env.MOCK_MONZO_URL}/balance`);
  }

  async getTransactions(accountId: string, start: Date, end: Date): Promise<MonzoTransaction[]> {
    this.logger.log('Fetching transaction data')
    const res = await this.getRequest<MonzoTransaction[]>(`${process.env.MOCK_MONZO_URL}/transactions`);

    return res.filter((transaction) => {
      const t = new Date(transaction.created);
      return t >= start && t <= end;
    });
  }

  // TODO: move to a http utils file and clean up implementation
  private async getRequest<T>(path: string): Promise<T> {
    try {
      return await firstValueFrom(
        this.http.get<T>(path, { timeout: 8000 }).pipe(
          map((response) => response.data),
          catchError((err) => {
            return throwError(() => new Error(`Failed to fetch ${path}, with error: ${err}`));
          }),
        ),
      );
    } catch (err) {
      this.logger.error(`Error fetching from ${path}:`);
      throw err;
    }
  }
}
