import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { TokenStorageService } from '../auth/token-storage.service';
import { AccountEntity, BalanceEntity, MerchantAddressEntity, MerchantEntity, TransactionEntity } from './entities';

type SyncEntity = 'accounts' | 'transactions' | 'merchants';
type SyncPhase = 'start' | 'progress' | 'done';
type SyncStage = `${SyncEntity}:sync:${SyncPhase}`;

interface SyncProgress {
    stage: SyncStage;
    accountId?: string;
    fetchedTransactions?: number;
    enrichedMerchants?: number;
}

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
    ) {}

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
    
            onProgress?.({ stage: 'merchants:sync:start' });
            await this.enrichMerchants(headers, onProgress);
            onProgress?.({ stage: 'merchants:sync:done' });
    
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

        onProgress?.({ stage: 'merchants:sync:start' });
        await this.enrichMerchants(headers, onProgress);
        onProgress?.({ stage: 'merchants:sync:done' });

        this.logger.log('Incremental Monzo sync complete.');
    }

    // TODO: remove included for testing purposes
    async testSync(startDate: Date, onProgress?: (p: SyncProgress) => void): Promise<void> {
        this.logger.log('Starting test Monzo sync...');
        const headers = await this.getAuthHeaders();

        onProgress?.({ stage: 'accounts:sync:start' });
        await this.syncAccountsAndBalances(headers);
        onProgress?.({ stage: 'accounts:sync:done' });

        onProgress?.({ stage: 'transactions:sync:start', accountId: undefined });
        await this.syncTransactions(headers, startDate, onProgress);
        onProgress?.({ stage: 'transactions:sync:done' });

        onProgress?.({ stage: 'merchants:sync:start' });
        await this.enrichMerchants(headers, onProgress);
        onProgress?.({ stage: 'merchants:sync:done' });

        this.logger.log('Test Monzo sync complete.');
    }

    private async syncAccountsAndBalances(headers: { Authorization: string }) {
        const accountResponse = await firstValueFrom(
            this.http.get(`${this.MONZO_API}/accounts`, { headers })
        );
        const accounts = accountResponse.data.accounts;

        for (const account of accounts) {
            await this.accountRepo.save({
                id: account.id,
                description: account.description,
                created: new Date(account.created),
            });

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
        }
    }

    private async syncTransactions(
        headers: { Authorization: string },
        since?: Date,
        onProgress?: (p: SyncProgress) => void
    ) {
        const accounts = await this.accountRepo.find();

        for (const account of accounts) {
            let nextSince = since ? since.toISOString() : undefined;
            let keepGoing = true;
            let totalFetched = 0;

            while (keepGoing) {
                let url = `${this.MONZO_API}/transactions?account_id=${account.id}&limit=200`;
                if (nextSince) {
                    url += `&since=${nextSince}`;
                }

                const transactionsResponse = await firstValueFrom(
                    this.http.get(url, { headers })
                );
                const transactions = transactionsResponse.data.transactions;

                this.logger.log(`Fetched ${transactions.length} transactions for account ${account.id}`);

                for (const tx of transactions) {
                    await this.transactionRepo.save({
                        id: tx.id,
                        accountId: account.id,
                        amount: tx.amount,
                        currency: tx.currency,
                        description: tx.description,
                        created: new Date(tx.created),
                        category: tx.category,
                        merchantId: typeof tx.merchant === 'string' ? tx.merchant : tx.merchant?.id,
                        metadata: tx.metadata || {},
                        notes: tx.notes,
                        is_load: tx.is_load,
                        settled: tx.settled ? new Date(tx.settled) : undefined,
                    });
                }

                totalFetched += transactions.length;
                onProgress?.({ stage: 'transactions:sync:progress', accountId: account.id, fetchedTransactions: totalFetched });

                if (transactions.length < 200) {
                    keepGoing = false;
                } else {
                    nextSince = transactions[transactions.length - 1].created;
                }
            }
        }
    }

    private async enrichMerchants(
        headers: { Authorization: string },
        onProgress?: (p: SyncProgress) => void
    ) {
        const transactions = await this.transactionRepo.find();
        const merchantIds = [
            ...new Set(transactions.filter(tx => tx.merchantId).map(tx => tx.merchantId!))
        ];

        const existingMerchants = await this.merchantRepo.find({ where: { id: In(merchantIds) } });
        const existingMerchantIds = new Set(existingMerchants.map(m => m.id));
        const missingMerchantIds = merchantIds.filter(id => !existingMerchantIds.has(id));

        this.logger.log(`Enriching ${missingMerchantIds.length} merchants...`);
        let enriched = 0;

        for (const merchantId of missingMerchantIds) {
            const txResponse = await firstValueFrom(
                this.http.get(`${this.MONZO_API}/transactions/${merchantId}?expand[]=merchant`, { headers })
            );
            const transaction = txResponse.data.transaction;

            if (transaction?.merchant) {
                const m = transaction.merchant;
                const address = new MerchantAddressEntity();
                address.address = m.address.address;
                address.city = m.address.city;
                address.country = m.address.country;
                address.latitude = m.address.latitude;
                address.longitude = m.address.longitude;
                address.postcode = m.address.postcode;
                address.region = m.address.region;

                const merchant = new MerchantEntity();
                merchant.id = m.id;
                merchant.name = m.name;
                merchant.category = m.category;
                merchant.emoji = m.emoji;
                merchant.logo = m.logo;
                merchant.created = new Date(m.created);
                merchant.address = address;

                await this.merchantRepo.save(merchant);
                enriched++;
                onProgress?.({ stage: 'merchants:sync:progress', enrichedMerchants: enriched });
            }
        }
    }
}
