import { Injectable } from "@nestjs/common";
import { MonzoService } from "./monzo-service.interface";
import { HttpService } from '@nestjs/axios';
import { TokenStorageService } from "src/auth/token-storage.service";
import { firstValueFrom } from "rxjs";
import { MonzoAccount, MonzoBalance, MonzoTransaction } from "@repo/monzo-types";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { AccountEntity } from "./entities/account.entity";
import { TransactionEntity } from "./entities/transaction.entity";
import { BalanceEntity } from "./entities/balance.entity";

// TODO: replace this service with a more complex approach of fetching from DB and offloading storing data to another service (cron)
@Injectable()
export class RealMonzoService implements MonzoService {
    constructor(
        @InjectRepository(AccountEntity) private readonly accountRepo: Repository<AccountEntity>,
        @InjectRepository(TransactionEntity) private readonly transactionRepo: Repository<TransactionEntity>,
        @InjectRepository(BalanceEntity) private readonly balanceRepo: Repository<BalanceEntity>,
    ) {}

    async getAccounts(): Promise<MonzoAccount[]> {
        const accounts = await this.accountRepo.find({});

        return accounts.map(account => ({
            id: account.id,
            description: account.description,
            created: account.created.toISOString(),
        }));
    }

    async getBalance(accountId: string): Promise<MonzoBalance> {
        const latestBalance = await this.balanceRepo.findOne({
            where: { accountId }
        });

        if (!latestBalance) {
            throw new Error(`No balance found for account ${accountId}`);
        }

        return {
            balance: latestBalance.balance,
            currency: latestBalance.currency,
            spend_today: latestBalance.spend_today,
        };
    }

    async getTransactions(accountId: string, start: Date, end: Date): Promise<MonzoTransaction[]> {
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
