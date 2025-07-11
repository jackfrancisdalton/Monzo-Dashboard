import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { TokenStorageService } from '../auth/token-storage.service';
import { AccountEntity, BalanceEntity, MerchantAddressEntity, MerchantEntity, TransactionEntity } from './entities';
import { MonzoAccount, MonzoSyncProgressUpdate } from '@repo/monzo-types';

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
            console.log(`Failed to complete full Monzo fetch: ${error}`)
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
            onProgress?.({ taskName: 'accounts', taskStage: 'start'});
            onProgress?.({ taskName: 'balances', taskStage: 'start'});

            const accountResponse = await firstValueFrom(
                this.http.get(`${this.MONZO_API}/accounts`, { headers })
            );

            const accounts = accountResponse.data.accounts;
            let balanceCount = 0;

            for (const account of accounts) {
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
                balanceCount++;
                onProgress?.({ taskName: 'balances', taskStage: 'progress' });
            }

            onProgress?.({ taskName: 'accounts', taskStage: 'completed', syncedCount: accounts.length });
            onProgress?.({ taskName: 'balances', taskStage: 'completed', syncedCount: balanceCount });
        } catch (err: any) {
            const errormessage = {
                message: 'Failed to fetch accounts and balances from Monzo API',
                details: err?.response?.data || err.message || 'Unknown error',
            };
            console.log('Failed to fetch accounts', errormessage);
        }
    }

    private async syncTransactions(
        headers: { Authorization: string },
        since?: Date,
        onProgress?: (p: MonzoSyncProgressUpdate) => void
    ) {
        const accounts = await this.accountRepo.find();
        onProgress?.({ taskName: 'transactions', taskStage: 'start' });
        let totalFetchedForAllAccounts = 0;

        for (const account of accounts) {
            const txFetchedCount = await this.syncTransactionsForAccount(account, headers, since, onProgress);
            totalFetchedForAllAccounts += txFetchedCount
        }
        onProgress?.({ taskName: 'transactions', taskStage: 'completed', syncedCount: totalFetchedForAllAccounts });
    }

    private async syncTransactionsForAccount(
        account: AccountEntity,
        headers: { Authorization: string },
        since?: Date,
        onProgress?: (p: MonzoSyncProgressUpdate) => void
    ): Promise<number> {
        const merchantCache = new Map<string, MerchantEntity>();
    
        // Starting date if provided, otherwise use account creation date
        let cursor = since ? new Date(since) : new Date(account.created);
        const now = new Date();
        const timeWindows: { start: string, end: string }[] = [];

        while (cursor < now) {
            const start = cursor.toISOString();
            cursor.setMonth(cursor.getMonth() + 1);
            const end = (cursor < now ? cursor : now).toISOString();
            timeWindows.push({ start, end });
        }
    
        const concurrency = 3;
        let running: Promise<void>[] = [];
        let totalFetched = 0;
    
        // Generate a promise for each time window to fetch transactions
        for (const window of timeWindows) {
            const promise = this.fetchTransactionsPage(account, headers, window.start, window.end)
                .then(async (transactions) => {
                    if (!transactions.length) return;
    
                    // resolve merchants immediately
                    for (const tx of transactions) {
                        if (tx.merchant && !merchantCache.has(tx.merchant.id)) {
                            const merchant = await this.findOrCreateMerchantCached(tx.merchant, merchantCache);
                            merchantCache.set(tx.merchant.id, merchant);
                        }
                    }
    
                    // bulk insert immediately
                    const entities = transactions.map(tx => ({
                        id: tx.id,
                        account,
                        amount: tx.amount,
                        currency: tx.currency,
                        description: tx.description,
                        created: new Date(tx.created),
                        category: tx.category,
                        merchant: tx.merchant ? merchantCache.get(tx.merchant.id) : undefined,
                        metadata: tx.metadata || {},
                        notes: tx.notes,
                        is_load: tx.is_load,
                        settled: tx.settled ? new Date(tx.settled) : undefined,
                    }));
    
                    console.log(`Fetched ${entities.length} transactions for account ${account.id} from ${window.start} to ${window.end}`);
                    await this.transactionRepo.save(entities);
                    totalFetched += entities.length;
    
                    // TODO: replace total fetched with number of batches completed
                    onProgress?.({ taskName: 'transactions', taskStage: 'progress', syncedCount: totalFetched });
                });
    
            running.push(promise);
    
            if (running.length >= concurrency) {
                await Promise.race(running);
                running = running.filter(p => !p['settled']); // keep unfinished
            }
        }
    
        // Wait for all remaining promises to finish then return
        await Promise.all(running);
        return totalFetched;
    }

    private async findOrCreateMerchantCached(
        merchantData: any,
        cache: Map<string, MerchantEntity>
    ): Promise<MerchantEntity> {
        if (cache.has(merchantData.id)) {
            return cache.get(merchantData.id)!;
        }
    
        let merchant = await this.merchantRepo.findOne({ where: { id: merchantData.id } });
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
        cache.set(merchantData.id, merchant);
        return merchant;
    }
    
    private async fetchTransactionsPage(
        account: AccountEntity,
        headers: { Authorization: string },
        since?: string,
        before?: string
    ): Promise<any[]> {
        let url = `${this.MONZO_API}/transactions?expand[]=merchant&account_id=${account.id}&limit=200`;
        if (since) url += `&since=${since}`;
        if (before) url += `&before=${before}`;
    
        try {
            const response = await firstValueFrom(this.http.get(url, { headers }));
            return response.data.transactions;
        } catch (error: any) {
            console.log('Failed to fetch transaction page', error.response?.data || error.message);
            throw new Error(`Failed to fetch transaction page: ${error.message}`);
        }
    }
}