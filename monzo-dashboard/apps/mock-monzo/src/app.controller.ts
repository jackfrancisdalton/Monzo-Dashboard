import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import type { MonzoAccount, MonzoBalance, MonzoTransaction } from '@repo/monzo-types';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/accounts')
  getAccounts(): MonzoAccount[] {
    return this.appService.getAccounts();
  }

  @Get('/balance')
  getBalance(): MonzoBalance {
    return this.appService.getBalance();
  }

  @Get("/transactions")
  getTransactions(): MonzoTransaction[] {
    return this.appService.getTransactions();
  }
}
