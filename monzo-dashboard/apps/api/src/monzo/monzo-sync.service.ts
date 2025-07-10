import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { TokenStorageService } from '../auth/token-storage.service';
import { AccountEntity, BalanceEntity, MerchantAddressEntity, MerchantEntity, TransactionEntity } from './entities';

type SyncEntity = 'accounts' | 'transactions';
type SyncPhase = 'start' | 'progress' | 'done';
type SyncStage = `${SyncEntity}:sync:${SyncPhase}` | 'completed';

interface SyncProgress {
    stage: SyncStage;
    accountId?: string;
    fetchedTransactions?: number;
    enrichedMerchants?: number;
}

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
        // TODO: Move this to a more appropriate place, or making it re-usable repo wide
        const axios = this.http.axiosRef;

        axios.interceptors.response.use(
          response => response,
          async (error) => {
            console.log('Axios error interceptor triggered');
            const originalRequest = error.config;
    
            // 401 for for auth failures, don't retry on 403 as these are valid permission failures 
            if (error.response?.status === 401 && !originalRequest._retry) {
              originalRequest._retry = true;
    
                console.log('refreshing tokens for Monzo');

              const newTokens = await this.tokenStorage.refreshTokens('monzo');
              originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
              console.log('Retrying request');

    
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

    async initialFullFetch(onProgress?: (p: SyncProgress) => void): Promise<void> {
        try {
            this.logger.log('Starting full Monzo fetch.');
            console.log('Starting full Monzo fetch...');
            const headers = await this.getAuthHeaders();
    
            onProgress?.({ stage: 'accounts:sync:start' });
            await this.syncAccountsAndBalances(headers);
            onProgress?.({ stage: 'accounts:sync:done' });
    
            onProgress?.({ stage: 'transactions:sync:start' });
            await this.syncTransactions(headers, undefined, onProgress);
            onProgress?.({ stage: 'transactions:sync:done' });

            onProgress?.({ stage: 'completed' });
            this.logger.log('Full Monzo fetch complete.');
        } catch (error: any) {
            this.logger.error('Error during full Monzo fetch:', error.message);
            throw new Error(`Failed to complete full Monzo fetch: ${error.message}`);
        }

    }

    async incrementalSync(onProgress?: (p: SyncProgress) => void): Promise<void> {
        this.logger.log('Starting incremental Monzo sync...');
        const headers = await this.getAuthHeaders();

        onProgress?.({ stage: 'accounts:sync:start' });
        await this.syncAccountsAndBalances(headers);
        onProgress?.({ stage: 'accounts:sync:done' });

        const lastTx = await this.transactionRepo.findOne({
            order: { created: 'DESC' },
        });

        onProgress?.({ stage: 'transactions:sync:start', accountId: undefined });
        await this.syncTransactions(headers, lastTx?.created, onProgress);
        onProgress?.({ stage: 'transactions:sync:done' });

        this.logger.log('Incremental Monzo sync complete.');
    }

    private async syncAccountsAndBalances(headers: { Authorization: string }) {
        try {
            const accountResponse = await firstValueFrom(
                this.http.get(`${this.MONZO_API}/accounts`, { headers })
            );
            const accounts = accountResponse.data.accounts;

            for (const account of accounts) {

                console.log(`Syncing account: ${account.id} - ${account.description}`);
                await this.accountRepo.save({
                    id: account.id,
                    description: account.description,
                    created: new Date(account.created),
                });
                console.log(`Account ${account.id} synced.`);
    
                console.log(`Fetching balance for account: ${account.id}`);
                const balanceResponse = await firstValueFrom(
                    this.http.get(`${this.MONZO_API}/balance?account_id=${account.id}`, { headers })
                );
                console.log(`Balance for account ${account.id} fetched successfully.`);
    
                console.log(`Saving balance for account: ${account.id}`);
                const balance = balanceResponse.data;    
                await this.balanceRepo.save({
                    accountId: account.id,
                    balance: balance.balance,
                    total_balance: balance.total_balance,
                    spend_today: balance.spend_today,
                    currency: balance.currency,
                });
                console.log(`Balance for account ${account.id} saved successfully.`);
            }
        } catch (err: any) {
            const errormessage = {
                message: 'Failed to fetch accounts and balances from Monzo API',
                details: err?.response?.data || err.message || 'Unknown error',
            }
            this.logger.error('Failed to fetch accounts', errormessage);
        }
    }

    private async syncTransactions(
        headers: { Authorization: string },
        since?: Date,
        onProgress?: (p: SyncProgress) => void
    ) {
        console.log('Starting transaction sync...');
        const accounts = await this.accountRepo.find();
    
        for (const account of accounts) {
            await this.syncTransactionsForAccount(account, headers, since, onProgress);
        }
    }
    
    private async syncTransactionsForAccount(
        account: AccountEntity,
        headers: { Authorization: string },
        since?: Date,
        onProgress?: (p: SyncProgress) => void
    ) {
        let nextSince = since ? since.toISOString() : undefined;
        let keepGoing = true;
        let totalFetched = 0;
    
        while (keepGoing) {
            const transactions = await this.fetchTransactionsPage(account, headers, nextSince);
    
            await this.saveTransactionsBatch(transactions, account);
    
            totalFetched += transactions.length;
            onProgress?.({ stage: 'transactions:sync:progress', accountId: account.id, fetchedTransactions: totalFetched });
    
            if (transactions.length < 200) {
                keepGoing = false;
                console.log(`No more transactions to fetch for account ${account.id}. Total fetched: ${totalFetched}`);
            } else {
                nextSince = transactions[transactions.length - 1].created;
                console.log(`Next since date for account ${account.id}: ${nextSince}`);
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
        this.logger.log(`Fetched ${response.data.transactions.length} transactions for account ${account.id}`);
        return response.data.transactions;
    }
    
    private async saveTransactionsBatch(transactions: any[], account: AccountEntity) {
        console.log(`Saving ${transactions.length} transactions for account: ${account.id}`);
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
        console.log(`Saved ${transactions.length} transactions for account: ${account.id}`);
    }
    
    private async findOrCreateMerchant(merchantData: any): Promise<MerchantEntity> {
        // Try preload first
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
    
        // if no pre-exising merchant try to create a new one
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
