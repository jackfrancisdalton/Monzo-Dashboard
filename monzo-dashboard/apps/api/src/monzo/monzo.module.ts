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
      timeout: 5 * 60 * 1000, // 5 minutes to reflect Monzo limit for full transaction history pull
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
      // Preferred USE_REAL_MONZO_API over process.env.production to allow for easier dev/prod development when required
      useClass: process.env.USE_REAL_MONZO_API === 'true' 
          ? RealMonzoService
          : MockMonzoService,
    },
  ],
  exports: [
    MonzoService,
  ],
})
export class MonzoModule {}
