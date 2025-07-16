import { Injectable, Logger } from "@nestjs/common";
import { MonzoService } from "./monzo-service.interface";
import { MonzoAccount, MonzoBalance, MonzoTransaction } from "@repo/monzo-types";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { AccountEntity } from "./entities/account.entity";
import { TransactionEntity } from "./entities/transaction.entity";
import { BalanceEntity } from "./entities/balance.entity";
import { MonzoAccountNotFoundException } from "./monzo.exceptions";

@Injectable()
export class RealMonzoService implements MonzoService {
    private readonly logger = new Logger(RealMonzoService.name);

    constructor(
        @InjectRepository(AccountEntity) private readonly accountRepo: Repository<AccountEntity>,
        @InjectRepository(TransactionEntity) private readonly transactionRepo: Repository<TransactionEntity>,
        @InjectRepository(BalanceEntity) private readonly balanceRepo: Repository<BalanceEntity>,
    ) {}


    async isConfigured(): Promise<boolean> {
        this.logger.log('Running monzo configuration check')

        // We consider the monzo app configured if we have at least on account stored in the DB.
        const numAccounts = await this.accountRepo.count();
        return numAccounts > 0;
    }

    async hasSomeData(): Promise<boolean> {
        this.logger.log('Checking if some data has already been synced')
        const accounts = await this.accountRepo.count();
        const transactions = await this.transactionRepo.count();
        return accounts > 0 && transactions > 0;
    }

    async getAccounts(): Promise<MonzoAccount[]> {
        this.logger.log('Fetching account data')
        const accounts = await this.accountRepo.find({});

        if (!accounts || accounts.length === 0) {
            throw new MonzoAccountNotFoundException();
        }
        
        return accounts.map(account => ({
            id: account.id,
            description: account.description,
            created: account.created.toISOString(),
        }));
    }

    async getBalance(accountId: string): Promise<MonzoBalance> {
        this.logger.log('Fetching balance data')

        const latestBalance = await this.balanceRepo.findOne({
            where: { accountId }
        });

        if (!latestBalance) {
            throw new MonzoAccountNotFoundException(accountId)
        }

        return {
            balance: latestBalance.balance,
            currency: latestBalance.currency,
            spend_today: latestBalance.spend_today,
        };
    }

    async getTransactions(accountId: string, start: Date, end: Date): Promise<MonzoTransaction[]> {
        this.logger.log('Fetching transaction data')

        const txs = await this.transactionRepo.find({
            where: {
                accountId,
                created: Between(start, end),
            },
            relations: ['merchant'],
        });

        return txs.map(tx => ({
            id: tx.id,
            accountId: tx.accountId,
            amount: tx.amount,
            currency: tx.currency,
            category: tx.category,
            merchant: tx.merchant ? {
                id: tx.merchant.id,
                name: tx.merchant.name,
                category: tx.merchant.category,
                emoji: tx.merchant.emoji,
                logo: tx.merchant.logo,
                address: tx.merchant.address,
            } : undefined,
            description: tx.description,
            created: tx.created.toISOString(),
        }));
    }
}
