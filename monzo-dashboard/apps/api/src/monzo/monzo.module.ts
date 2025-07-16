import { Module, DynamicModule } from '@nestjs/common';
import { MonzoService } from './monzo-service.interface';
import { RealMonzoService } from './real-monzo.service';
import { MockMonzoService } from './mock-monzo.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from './entities/account.entity';
import { BalanceEntity } from './entities/balance.entity';
import { TransactionEntity } from './entities/transaction.entity';
import { MerchantEntity } from './entities/merchant.entity';
import { MonzoSyncService } from './monzo-sync.service';
import { MonzoController } from './monzo.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MerchantAddressEntity } from './entities';

@Module({})
export class MonzoModule {
  static register(): DynamicModule {

    // If we're using mock data then we don't integrate sync services or database connections
    if (process.env.USE_REAL_MONZO_API !== 'true') {
      return {
        module: MonzoModule,
        imports: [HttpModule],
        providers: [
          { provide: MonzoService, useClass: MockMonzoService },
        ],
        controllers: [],
        exports: [MonzoService],
      };
    }

    return {
      module: MonzoModule,
      imports: [
        AuthModule.register(),
        HttpModule.register({
          timeout: 5 * 60 * 1000,
          maxRedirects: 5,
        }),
        TypeOrmModule.forFeature([
          MerchantAddressEntity,
          MerchantEntity,
          AccountEntity,
          BalanceEntity,
          TransactionEntity,
        ]),
      ],
      controllers: [MonzoController],
      providers: [
        MonzoSyncService,
        {
          provide: MonzoService,
          useClass: RealMonzoService,
        },
      ],
      exports: [MonzoService, MonzoSyncService],
    };
  }
}
