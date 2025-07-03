import { Module } from '@nestjs/common';
import { MonzoService } from './mock-monzo.service';

@Module({
  providers: [MonzoService]
})
export class MonzoModule {}
