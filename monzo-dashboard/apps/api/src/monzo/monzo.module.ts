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
import { MonzoController } from './monzo.controller';

@Module({
  imports: [
    AuthModule, 
    HttpModule.register({
      timeout: 5 * 60 * 10, // 5 minutes to reflect monzo limitations
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([
      AccountEntity,
      BalanceEntity,
      TransactionEntity,
      MerchantEntity,
    ]),
  ],
  controllers: [
    MonzoController
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
