import { Module } from '@nestjs/common';
import { MonzoService } from './monzo-service.interface';
import { RealMonzoService } from './real-monzo.service';
import { MockMonzoService } from './mock-monzo.service';

@Module({
  providers: [
    {
      provide: MonzoService,
      useClass: process.env.NODE_ENV === 'production'
        ? RealMonzoService
        : MockMonzoService
    }
  ],
  exports: [MonzoService]
})
export class MonzoModule {}
