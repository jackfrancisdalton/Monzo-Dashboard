import { MonzoAccount, MonzoBalance, MonzoTransaction } from "@repo/monzo-types";

export abstract class MonzoService {
    abstract getAccounts(): Promise<MonzoAccount[]>;
    abstract getBalance(): Promise<MonzoBalance>;
    abstract getTransactions(start, end): Promise<MonzoTransaction[]>;
}