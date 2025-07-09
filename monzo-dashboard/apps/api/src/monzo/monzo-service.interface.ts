import { MonzoAccount, MonzoBalance, MonzoTransaction } from "@repo/monzo-types";

export abstract class MonzoService {
    abstract getAccounts(): Promise<MonzoAccount[]>;
    abstract getBalance(accountId: string): Promise<MonzoBalance>;
    abstract getTransactions(accountId: string, start: Date, end: Date): Promise<MonzoTransaction[]>;
}