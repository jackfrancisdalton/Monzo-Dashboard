import { Injectable } from '@nestjs/common';
import type { MonzoAccount, MonzoBalance, MonzoTransaction } from '@repo/monzo-types';
import { MonzoService } from './monzo-service.interface';
import { HttpService } from '@nestjs/axios';
import { map, catchError } from 'rxjs/operators';
import { firstValueFrom, throwError } from 'rxjs';

@Injectable()
export class MockMonzoService implements MonzoService {

    constructor(
      private readonly http: HttpService
    ) {}
    
    async getAccounts(): Promise<MonzoAccount[]> {
      return this.getRequest<MonzoAccount[]>(`/accounts`);
    }
    
    async getBalance(): Promise<MonzoBalance> {
      return this.getRequest<MonzoBalance>(`/balance`); 
    }
    
    async getTransactions(start: Date, end: Date): Promise<MonzoTransaction[]> {
      const res = await this.getRequest<MonzoTransaction[]>(`/transactions`);

      // Sort out bug date is string here for some reason
      const result =  res.filter((transaction) => {
        const t = new Date(transaction.created);
        return t >= new Date(start) && t <= new Date(end);
      });

      return result;
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
