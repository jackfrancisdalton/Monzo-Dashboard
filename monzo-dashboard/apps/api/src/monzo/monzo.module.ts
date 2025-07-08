import { Module } from '@nestjs/common';
import { MonzoService } from './monzo-service.interface';
import { RealMonzoService } from './real-monzo.service';
import { MockMonzoService } from './mock-monzo.service';
import { HttpModule } from '@nestjs/axios';
import { TokenStorageService } from 'src/auth/token-storage.service';

@Module({
  imports: [
    TokenStorageService,
    HttpModule.register({
      baseURL: 'http://localhost:3001', // TODO: make this use env variables instead
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
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
