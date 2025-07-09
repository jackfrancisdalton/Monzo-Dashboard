import { Injectable, NotImplementedException } from "@nestjs/common";
import { MonzoAccount, MonzoBalance, MonzoTransaction } from "@repo/monzo-types";
import { MonzoService } from "./monzo-service.interface";
import { HttpService } from '@nestjs/axios';
import { TokenStorageService } from "src/auth/token-storage.service";


@Injectable()
export class RealMonzoService implements MonzoService {
    private MONZO_API = 'https://api.monzo.com';

    constructor(
        private readonly http: HttpService,
        private readonly tokenStorageService: TokenStorageService,
    ) {}

    private async getHeaders() {
        const token = await this.tokenStorageService.getTokens('monzo');

        if (!token) {
            throw new Error("Monzo Oauth Token is null or undefined");
        }

        return { Authorization: `Bearer ${token.accessToken}` };
    }

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
