import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { TokenStorageService } from '../auth/token-storage.service';
import { AccountEntity, BalanceEntity, MerchantAddressEntity, MerchantEntity, TransactionEntity } from './entities';
import { MonzoSyncProgressUpdate } from '@repo/monzo-types';

// TODO: clean up general logging approach, errorhandling, progress reporting and logging content
@Injectable()
export class MonzoSyncService {
    private readonly logger = new Logger(MonzoSyncService.name);
    private readonly MONZO_API = 'https://api.monzo.com';

    constructor(
        private readonly http: HttpService,
        private readonly tokenStorage: TokenStorageService,
        @InjectRepository(AccountEntity) private readonly accountRepo: Repository<AccountEntity>,
        @InjectRepository(BalanceEntity) private readonly balanceRepo: Repository<BalanceEntity>,
        @InjectRepository(TransactionEntity) private readonly transactionRepo: Repository<TransactionEntity>,
        @InjectRepository(MerchantEntity) private readonly merchantRepo: Repository<MerchantEntity>,
    ) {
        const axios = this.http.axiosRef;

        axios.interceptors.response.use(
            response => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    const newTokens = await this.tokenStorage.refreshTokens('monzo');
                    originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;

                    return axios(originalRequest);
                }

                return Promise.reject(error);
            }
        );
    }

    private async getAuthHeaders(): Promise<{ Authorization: string }> {
        const tokens = await this.tokenStorage.getTokens('monzo');

        if (!tokens || !tokens.accessToken) {
            throw new Error('No Monzo access token found. Please authenticate first.');
        }

        return {
            Authorization: `Bearer ${tokens.accessToken}`,
        };
    }

    async initialFullFetch(onProgress?: (p: MonzoSyncProgressUpdate) => void): Promise<void> {
        try {
            const headers = await this.getAuthHeaders();
            await this.syncAccountsAndBalances(headers, onProgress);
            await this.syncTransactions(headers, undefined, onProgress);
        } catch (error: any) {
            throw new Error(`Failed to complete full Monzo fetch: ${error.message}`);
        }
    }

    async incrementalSync(onProgress?: (p: MonzoSyncProgressUpdate) => void): Promise<void> {
        try {
            // use last transaction point as starting point of fetch
            const lastTx = await this.transactionRepo.findOne({ order: { created: 'DESC' } });
            const headers = await this.getAuthHeaders();

            await this.syncAccountsAndBalances(headers, onProgress);
            await this.syncTransactions(headers, lastTx?.created, onProgress);
        } catch (error: any) {
            throw new Error(`Failed to complete incremental Monzo fetch: ${error.message}`);
        }
    }

    private async syncAccountsAndBalances(
        headers: { Authorization: string },
        onProgress?: (p: MonzoSyncProgressUpdate) => void
    ) {
        try {
            onProgress?.({ taskName: 'accounts', taskStage: 'start' });
            onProgress?.({ taskName: 'balances', taskStage: 'start' });

            const accountResponse = await firstValueFrom(
                this.http.get(`${this.MONZO_API}/accounts`, { headers })
            );

            for (const account of accountResponse.data.accounts) {
                await this.accountRepo.save({
                    id: account.id,
                    description: account.description,
                    created: new Date(account.created),
                });
                onProgress?.({ taskName: 'accounts', taskStage: 'progress' });

                const balanceResponse = await firstValueFrom(
                    this.http.get(`${this.MONZO_API}/balance?account_id=${account.id}`, { headers })
                );

                const balance = balanceResponse.data;
                await this.balanceRepo.save({
                    accountId: account.id,
                    balance: balance.balance,
                    total_balance: balance.total_balance,
                    spend_today: balance.spend_today,
                    currency: balance.currency,
                });
                onProgress?.({ taskName: 'balances', taskStage: 'progress' });
            }

            onProgress?.({ taskName: 'accounts', taskStage: 'completed' });
            onProgress?.({ taskName: 'balances', taskStage: 'completed' });
        } catch (err: any) {
            const errormessage = {
                message: 'Failed to fetch accounts and balances from Monzo API',
                details: err?.response?.data || err.message || 'Unknown error',
            };
            this.logger.error('Failed to fetch accounts', errormessage);
        }
    }

    private async syncTransactions(
        headers: { Authorization: string },
        since?: Date,
        onProgress?: (p: MonzoSyncProgressUpdate) => void
    ) {
        const accounts = await this.accountRepo.find();
        onProgress?.({ taskName: 'transactions', taskStage: 'start' });

        for (const account of accounts) {
            await this.syncTransactionsForAccount(account, headers, since, onProgress);
        }
        onProgress?.({ taskName: 'transactions', taskStage: 'completed' });
    }

    private async syncTransactionsForAccount(
        account: AccountEntity,
        headers: { Authorization: string },
        since?: Date,
        onProgress?: (p: MonzoSyncProgressUpdate) => void
    ) {
        let nextSince = since ? since.toISOString() : undefined;
        let keepGoing = true;
        let totalFetched = 0;

        while (keepGoing) {
            const transactions = await this.fetchTransactionsPage(account, headers, nextSince);
            await this.saveTransactionsBatch(transactions, account);
            totalFetched += transactions.length;
            onProgress?.({ taskName: 'transactions', taskStage: 'progress' });

            if (transactions.length < 200) {
                keepGoing = false;
            } else {
                nextSince = transactions[transactions.length - 1].created;
            }
        }
    }

    private async fetchTransactionsPage(
        account: AccountEntity,
        headers: { Authorization: string },
        since?: string
    ): Promise<any[]> {
        let url = `${this.MONZO_API}/transactions?expand[]=merchant&account_id=${account.id}&limit=200`;

        if (since) {
            url += `&since=${since}`;
        }

        const response = await firstValueFrom(this.http.get(url, { headers }));
        return response.data.transactions;
    }

    private async saveTransactionsBatch(transactions: any[], account: AccountEntity) {
        for (const tx of transactions) {
            const merchant = tx.merchant ? await this.findOrCreateMerchant(tx.merchant) : undefined;

            await this.transactionRepo.save({
                id: tx.id,
                account,
                amount: tx.amount,
                currency: tx.currency,
                description: tx.description,
                created: new Date(tx.created),
                category: tx.category,
                merchant,
                metadata: tx.metadata || {},
                notes: tx.notes,
                is_load: tx.is_load,
                settled: tx.settled ? new Date(tx.settled) : undefined,
            });
        }
    }

    private async findOrCreateMerchant(merchantData: any): Promise<MerchantEntity> {
        let merchant = await this.merchantRepo.preload({
            id: merchantData.id,
            name: merchantData.name,
            category: merchantData.category,
            emoji: merchantData.emoji,
            logo: merchantData.logo,
            created: new Date(merchantData.created),
            address: {
                address: merchantData.address?.address || '',
                city: merchantData.address?.city || '',
                country: merchantData.address?.country || '',
                latitude: merchantData.address?.latitude || 0,
                longitude: merchantData.address?.longitude || 0,
                postcode: merchantData.address?.postcode || '',
                region: merchantData.address?.region || '',
            }
        });

        if (!merchant) {
            const address = new MerchantAddressEntity();
            address.address = merchantData.address?.address || '';
            address.city = merchantData.address?.city || '';
            address.country = merchantData.address?.country || '';
            address.latitude = merchantData.address?.latitude || 0;
            address.longitude = merchantData.address?.longitude || 0;
            address.postcode = merchantData.address?.postcode || '';
            address.region = merchantData.address?.region || '';

            const safeCreatedDate = (merchantData.created && !isNaN(Date.parse(merchantData.created)))
                ? new Date(merchantData.created)
                : undefined;

            merchant = this.merchantRepo.create({
                id: merchantData.id,
                name: merchantData.name,
                category: merchantData.category,
                emoji: merchantData.emoji,
                logo: merchantData.logo,
                created: safeCreatedDate,
                address,
            });

            await this.merchantRepo.save(merchant);
        }
        return merchant;
    }
}
