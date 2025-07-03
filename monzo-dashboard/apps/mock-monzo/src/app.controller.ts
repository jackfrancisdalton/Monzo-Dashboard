import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import type { MonzoAccount, MonzoBalance, MonzoTransaction } from '@repo/monzo-types';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/accounts')
  getAccounts(): MonzoAccount[] {
    const account: MonzoAccount = {
      id: '123456789',
      description: 'My Monzo Account',
      created: '2023-01-01T00:00:00Z',
    };

    return [account];
  }

  @Get('/balance')
  getBalance(): MonzoBalance {
    const balance: MonzoBalance = {
      balance: 1000,
      currency: 'GBP',
      spend_today: 50,
    };

    return balance;
  }

  @Get()
  getTransactions(): MonzoTransaction[] {
    const transaction: MonzoTransaction = {
      id: 'txn_123456789',
      amount: -500,
      description: 'Coffee Shop',
      created: '2023-01-01T10:00:00Z',
      currency: 'GBP',
      category: 'Food & Drink',
      merchant: {
        id: 'merchant_123456789',
        name: 'Coffee Shop',
        category: 'Food & Drink',
        logo: 'https://example.com/logo.png',
      },
    };

    return [transaction];
  }
}
