import { Injectable, Logger } from '@nestjs/common';
import { AccountsSummary, CumulativeLineDatum, DashboardSummary, PieDatum, TopTransactionsDatum, TreemapData } from '@repo/dashboard-types';
import { MonzoTransaction } from '@repo/monzo-types';
import { MonzoService } from 'src/monzo/monzo-service.interface';
import { computeCumulativeLineData } from './mappers/line-datum-mapper';
import { computeTreeMapData } from './mappers/tree-map-data-mapper';
import { computeGenericPieData } from './mappers/pie-datum-mapper';
import { InvalidAccountIdException, NoAccountsConfiguredException } from './dashboard-data.exceptions';

@Injectable()
export class DashboardDataService {
    private readonly logger = new Logger(DashboardDataService.name);

    constructor(
        private readonly monzoService: MonzoService
    ) {}

    // TECH-NOTE: For now we only implement monzo data so only need to verify it is configured.
    // In the future we may support multiple providers, so this could be expanded.
    async isConfigured(): Promise<boolean> {
        this.logger.log('Checking if dashboard is configured.')
        return this.monzoService.isConfigured();
    }

    async getAccounts(): Promise<AccountsSummary> {
        this.logger.log('Fetching accounts summary.')
        const accounts = await this.monzoService.getAccounts();
        
        if (accounts.length === 0) {
            throw new NoAccountsConfiguredException();
        }

        const mappedAccounts = accounts.map(account => ({
            id: account.id,
            description: account.description,
            created: account.created,
        }));

        return { accounts: mappedAccounts };
    }

    async getDashboardData(accountId: string, start: Date, end: Date): Promise<DashboardSummary> {
        this.logger.log('Fetching dashboard data.')
        const accounts = await this.monzoService.getAccounts();

        if(accounts.length === 0) {
            throw new NoAccountsConfiguredException();
        }

        const targetAccountId = accounts.find(account => account.id === accountId)?.id;

        if(!targetAccountId) {
            throw new InvalidAccountIdException(accountId);
        }

        const [balance, transactions] = await Promise.all([
            this.monzoService.getBalance(targetAccountId),
            this.monzoService.getTransactions(targetAccountId, start, end),
        ]);

        const { creditTxs, debitTxs } = this.splitTransactionsByCreditDebit(transactions);

        return {  
            balance: balance,
            creditAndDebitOverTimeLineData: this.getSpendingAndIncomeOverTimeLineData(creditTxs, debitTxs),
            creditsByCategoryPieData: this.getSpendingByCategoryPieChart(creditTxs),
            debitsByCategoryPieData: this.getSpendingByCategoryPieChart(debitTxs),
            creditsByDescriptionTreeMap: this.getTreeMapByDescriptionData(creditTxs),
            debitsByDescriptionTreeMap: this.getTreeMapByDescriptionData(debitTxs),
            topDebits: this.getTopTransactions(debitTxs, 10),
            topCredits: this.getTopTransactions(creditTxs, 10),
            totalDebit: this.toMajorCurrency(
                debitTxs.reduce((acc, tx) => acc + (tx.amount < 0 ? Math.abs(tx.amount) : 0), 0)
            ),
            totalCredit: this.toMajorCurrency(
                creditTxs.reduce((acc, tx) => acc + (tx.amount > 0 ? Math.abs(tx.amount) : 0), 0)
            ),
        };
    }

    /*
    * TODO: review approach to data formatting. We are repeatedly computing the same data in different places.
    * It makes it easy to expand on but isn't very efficient. That said it's still more than fast enough so leaving for now.
    */

    private getSpendingAndIncomeOverTimeLineData(creditTxs: MonzoTransaction[], debitTxs: MonzoTransaction[]): CumulativeLineDatum[] {    
        const spendingLine = computeCumulativeLineData(
            "Debits",
            debitTxs,
            (tx) => new Date(tx.created),
            (tx) => this.toMajorCurrency(Math.abs(tx.amount))
        );
    
        const incomeLine = computeCumulativeLineData(
            "Credits",
            creditTxs,
            (tx) => new Date(tx.created),
            (tx) => this.toMajorCurrency(Math.abs(tx.amount))
        );
    
        return [spendingLine[0]!, incomeLine[0]!];
    }

    private getTreeMapByDescriptionData(transactions: MonzoTransaction[]): TreemapData {
        return computeTreeMapData(
            transactions,
            (tx) => tx.description ?? "unknown",
            (tx) => this.toMajorCurrency(Math.abs(tx.amount))
        );
    }

    private getSpendingByCategoryPieChart(transactions: MonzoTransaction[]): PieDatum[] {
        return computeGenericPieData(
            transactions,
            (tx) => tx.category ?? 'unknown',
            (tx) => this.toMajorCurrency(Math.abs(tx.amount))
        );
    }

    private getTopTransactions(transactions: MonzoTransaction[], numberOfTxs: number): TopTransactionsDatum[] {
        return [...transactions]
            .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
            .slice(0, numberOfTxs)
            .map((tx) => ({
                amount: this.toMajorCurrency(Math.abs(tx.amount)),
                date: new Date(tx.created),
                label: tx.description || 'No description',
            }));
    }

    private splitTransactionsByCreditDebit(transactions: MonzoTransaction[]): { creditTxs: MonzoTransaction[], debitTxs: MonzoTransaction[] } {
        const sortedTransactions = [...transactions].sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());

        return sortedTransactions.reduce((acc, tx) => {
            if (tx.amount > 0) {
                acc.creditTxs.push(tx);
            } else if (tx.amount < 0) {
                acc.debitTxs.push(tx);
            }

            return acc;
        }, { creditTxs: [], debitTxs: [] } as { creditTxs: MonzoTransaction[], debitTxs: MonzoTransaction[] });
    }

    // TODO: move to utils file
    private toMajorCurrency(amount: number): number {
        return parseFloat((amount / 100).toFixed(2));
    }
}
