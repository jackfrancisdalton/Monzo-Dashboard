import { Injectable } from '@nestjs/common';
import type { MonzoAccount, MonzoBalance, MonzoTransaction } from '@repo/monzo-types';
import { MonzoService } from './monzo-service.interface';
import { HttpService } from '@nestjs/axios';
import { map, catchError } from 'rxjs/operators';
import { firstValueFrom, throwError } from 'rxjs';

@Injectable()
export class MockMonzoService implements MonzoService {
  constructor(private readonly http: HttpService) {}

  async isConfigured(): Promise<boolean> {
    // No Oauth required for mock service so we considered it always configured.
    return true;
  }

  async getAccounts(): Promise<MonzoAccount[]> {
    return this.getRequest<MonzoAccount[]>(`${process.env.VITE_MOCK_MONZO_URL}/accounts`);
  }

  async getBalance(accountId: string): Promise<MonzoBalance> {
    return this.getRequest<MonzoBalance>(`${process.env.VITE_MOCK_MONZO_URL}/balance`);
  }

  async getTransactions(accountId: string, start: Date, end: Date): Promise<MonzoTransaction[]> {
    const res = await this.getRequest<MonzoTransaction[]>(`${process.env.VITE_MOCK_MONZO_URL}/transactions`);

    return res.filter((transaction) => {
      const t = new Date(transaction.created);
      return t >= start && t <= end;
    });
  }

  // TODO: move to a http utils file
  private async getRequest<T>(path: string): Promise<T> {
    try {
      return await firstValueFrom(
        this.http.get<T>(path).pipe(
          map((response) => response.data),
          catchError((err) => {
            return throwError(() => new Error(`Failed to fetch ${path}`));
          }),
        ),
      );
    } catch (err) {
      throw err;
    }
  }
}
