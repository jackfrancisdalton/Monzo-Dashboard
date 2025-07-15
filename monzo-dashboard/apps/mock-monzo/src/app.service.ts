import { Injectable } from '@nestjs/common';
import { MonzoAccount, MonzoBalance, MonzoTransaction } from '@repo/monzo-types';
import fs from 'fs';
import path from 'path';

@Injectable()
export class AppService {
    private readonly dataDir = path.resolve(process.cwd(), './mock-data');

    // TECH_DEBT: replace json names with const that can be shared in a turborepo package with the genration script

    getAccounts(): MonzoAccount[] {
        return JSON.parse(fs.readFileSync(path.join(this.dataDir, 'accounts.json'), 'utf-8')).accounts;
    }

    getBalance(): MonzoBalance {
        return JSON.parse(fs.readFileSync(path.join(this.dataDir, 'balance.json'), 'utf-8'));
    }

    getTransactions(): MonzoTransaction[] {
        return JSON.parse(fs.readFileSync(path.join(this.dataDir, 'transactions.json'), 'utf-8')).transactions;
    }
}
