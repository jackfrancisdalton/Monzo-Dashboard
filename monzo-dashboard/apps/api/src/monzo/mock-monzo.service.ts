import { Injectable, NotImplementedException } from '@nestjs/common';
import type { MonzoAccount, MonzoBalance, MonzoTransaction } from '@repo/monzo-types';
import { MonzoService } from './monzo-service.interface';
import { HttpService } from '@nestjs/axios';

// TODO: make this use env variables instead
const BASE_URL = 'http://localhost:3001';

@Injectable()
export class MockMonzoService implements MonzoService {

    constructor(
        private readonly http: HttpService
    ) {}
    
    async getAccounts(): Promise<MonzoAccount[]> {
        throw new NotImplementedException('MockMonzoService.getAccounts is not implemented');
    }
    
    async getBalance(): Promise<MonzoBalance> {
        throw new NotImplementedException('MockMonzoService.getBalance is not implemented');
    }
    
    async getTransactions(): Promise<MonzoTransaction[]> {
        throw new NotImplementedException('MockMonzoService.getTransactions is not implemented');
    }
}
