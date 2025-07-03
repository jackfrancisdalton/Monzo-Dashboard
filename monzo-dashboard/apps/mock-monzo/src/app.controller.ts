import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getAccounts(): any {
    return {};
  }

  @Get('/balance')
  getBalance() {
    return {};
  }

  @Get()
  getTransactions(): any {
    return {};
  }
}
