import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, In } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { TokenStorageService } from '../auth/token-storage.service';
import { AccountEntity, BalanceEntity, MerchantAddressEntity, MerchantEntity, TransactionEntity } from './entities';

// TODO: given the large number of transactions and general data here, we will likely want to introduce some pagination,
// this will also help with providing progress reports to the user during the sync process.

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

  // Entry point: initial sync after fresh OAuth login
  // Can only fetch all data within 5 minutes of auth due to:
  // https://docs.monzo.com/#retrieve-transaction
  async initialFullFetch(): Promise<void> {
    this.logger.log('Starting full Monzo fetch.');
    const headers = await this.getAuthHeaders();

    this.logger.log('Starting accounts and balances full sync.');
    await this.syncAccountsAndBalances(headers);
    this.logger.log('Completed accounts and balances full sync.');

    this.logger.log('Starting transaction full sync.');
    await this.syncTransactions(headers);
    this.logger.log('Starting transaction full sync.');

    this.logger.log('Starting full enrichment of merchant data.');
    await this.enrichMerchants(headers);
    this.logger.log('Completed full enrichment of merchant data');

    this.logger.log('Full Monzo fetch complete.');
  }

  // Entry point: incremental sync on app boot or user refresh
  async incrementalSync(): Promise<void> {
    this.logger.log('Starting incremental Monzo sync...');
    const headers = await this.getAuthHeaders();
    await this.syncAccountsAndBalances(headers);

    // find latest transaction date we have in the DB as the start of our fetch
    const lastTx = await this.transactionRepo.findOne({
      order: { created: 'DESC' },
    });

    this.logger.log('Starting transaction sync from last known transaction date:', lastTx?.created);
    await this.syncTransactions(headers, lastTx?.created);
    this.logger.log('Finished Transaction sync, now enriching merchants...');

    this.logger.log('Starting merchant enrichment.');
    await this.enrichMerchants(headers);
    this.logger.log('Finished Merchant enrichment.');

    this.logger.log('Incremental Monzo sync complete.');
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

  private async syncTransactions(headers: { Authorization: string }, since?: Date) {
    const accounts = await this.accountRepo.find();

    for (const account of accounts) {
      const url = `${this.MONZO_API}/transactions?account_id=${account.id}` + (since ? `&since=${since.toISOString()}` : '');

      const transactionsResponse = await firstValueFrom(
        this.http.get(url, { headers })
      );

      const transactions = transactionsResponse.data.transactions;

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
    }
  }

  /**
   * List transactions end point does not return full merchant data,
   * so we need to fetch each merchant by its ID.
   * This is done after all transactions are fetched to avoid rate limiting.
   * @param headers 
   */
  private async enrichMerchants(headers: { Authorization: string }) {
    const transactions = await this.transactionRepo.find();
    const merchantIds = [
      ...new Set(transactions.filter(tx => tx.merchantId).map(tx => tx.merchantId!))
    ];

    const existingMerchants = await this.merchantRepo.find({ where: { id: In(merchantIds) }});
    const existingMerchantIds = new Set(existingMerchants.map(m => m.id));
    const missingMerchantIds = merchantIds.filter(id => !existingMerchantIds.has(id));

    this.logger.log(`Enriching ${missingMerchantIds.length} merchants...`);

    for (const merchantId of missingMerchantIds) {
      // we call by merchant *transaction* id not merchant id because Monzo API requires transaction id
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
      }
    }
  }
}
