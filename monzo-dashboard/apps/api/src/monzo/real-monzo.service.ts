import { Injectable, NotImplementedException } from "@nestjs/common";
import { MonzoAccount, MonzoBalance, MonzoTransaction } from "@repo/monzo-types";
import { MonzoService } from "./monzo-service.interface";
import { HttpService } from '@nestjs/axios';


@Injectable()
export class RealMonzoService implements MonzoService {

    constructor(
        private readonly http: HttpService
    ) {}

    async getAccounts(): Promise<MonzoAccount[]> {
        throw new NotImplementedException("Method not implemented");
    }
    
    async getBalance(): Promise<MonzoBalance> {
        throw new NotImplementedException("Method not implemented");

    }
    
    async getTransactions(): Promise<MonzoTransaction[]> {
        throw new NotImplementedException("Method not implemented");
    }
}
