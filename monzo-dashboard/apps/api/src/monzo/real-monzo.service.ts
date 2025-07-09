import { Injectable } from "@nestjs/common";
import { MonzoService } from "./monzo-service.interface";
import { HttpService } from '@nestjs/axios';
import { TokenStorageService } from "src/auth/token-storage.service";
import { firstValueFrom } from "rxjs";
import { MonzoAccount, MonzoBalance, MonzoTransaction } from "@repo/monzo-types";

// TODO: replace this service with a more complex approach of fetching from DB and offloading storing data to another service (cron)
@Injectable()
export class RealMonzoService implements MonzoService {
    private MONZO_API = 'https://api.monzo.com';

    constructor(
        private readonly httpService: HttpService,
        private readonly tokenStorageService: TokenStorageService,
    ) {}

    private async getAuthHeaders() {
        const token = await this.tokenStorageService.getTokens('monzo');

        if (!token) {
            throw new Error("Monzo Oauth Token is null or undefined");
        }

        return { Authorization: `Bearer ${token.accessToken}` };
    }

    async getAccounts(): Promise<MonzoAccount[]> {
        const headers = await this.getAuthHeaders();

        // TODO: Handle token refresh logic using a helper function or interceptor (and for all other services)
        const response = await firstValueFrom(
            this.httpService.get(`${this.MONZO_API}/accounts`, { headers })
        );
        return response.data.accounts;
    }

    async getBalance(accountId: string): Promise<MonzoBalance> {
        const headers = await this.getAuthHeaders();
        const response = await firstValueFrom(
            this.httpService.get(`${this.MONZO_API}/balance?account_id=${accountId}`, { headers })
        );
        return response.data;
    }

    async getTransactions(accountId: string): Promise<MonzoTransaction[]> {
        const headers = await this.getAuthHeaders();
        const response = await firstValueFrom(
            this.httpService.get(`${this.MONZO_API}/transactions?account_id=${accountId}`, { headers })
        );
        return response.data.transactions;
    }
}
