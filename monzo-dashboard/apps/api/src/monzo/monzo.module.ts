import { Module } from '@nestjs/common';
import { MonzoService } from './monzo-service.interface';
import { RealMonzoService } from './real-monzo.service';
import { MockMonzoService } from './mock-monzo.service';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from './entities/account.entity';
import { BalanceEntity } from './entities/balance.entity';
import { TransactionEntity } from './entities/transaction.entity';
import { MerchantEntity } from './entities/merchant.entity';
import { MonzoSyncService } from './monzo-sync.service';

@Module({
  imports: [
    AuthModule,
    HttpModule.register({
      baseURL: 'http://localhost:3001', // TODO: make this use env variables instead
      timeout: 5000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([
      AccountEntity,
      BalanceEntity,
      TransactionEntity,
      MerchantEntity,
    ]),
  ],
  providers: [
    MonzoSyncService,
    {
      provide: MonzoService,
      useClass:
        process.env.NODE_ENV === 'production'
          ? RealMonzoService
          : MockMonzoService,
    },
  ],
  exports: [
    MonzoService,
  ],
})
export class MonzoModule {}
