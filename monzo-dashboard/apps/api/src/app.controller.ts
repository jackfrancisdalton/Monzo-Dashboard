import { Controller, Get } from '@nestjs/common';
import { MonzoService } from './monzo/monzo-service.interface';

@Controller()
export class AppController {
  constructor(
    private readonly monzoService: MonzoService, 
  ) {}

  @Get()
  async getDashBoard(): Promise<any> {
    const [accounts, balance, transactions] = await Promise.all([
      this.monzoService.getAccounts(),
      this.monzoService.getBalance(),
      this.monzoService.getTransactions(),
    ])

    return { accounts, balance, transactions };
  }
}
