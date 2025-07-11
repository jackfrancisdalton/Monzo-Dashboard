import { Injectable } from '@nestjs/common';
import { AccountsSummary, CumulativeLineDatum, DashboardSummary, PieDatum, TopTransactionsDatum, TreemapData } from '../../../../packages/dashboard-types/src';
import { MonzoAccount, MonzoTransaction } from '@repo/monzo-types';
import { MonzoService } from 'src/monzo/monzo-service.interface';
import { computeCumulativeLineData } from './mappers/line-datum-mapper';
import { computeTreeMapData } from './mappers/tree-map-data-mapper';
import { computeGenericPieData } from './mappers/pie-datum-mapper';

// TODO: need to differnatiate between spending, transfers and debiting for data responses
@Injectable()
export class DashboardDataService {

    constructor(
        private readonly monzoService: MonzoService
    ) {}

    async isConfigured(): Promise<boolean> {
        // For now we only implement monzo so only need to verify it is configured.
        // In the future we may support multiple providers, so this could be expanded.
        return this.monzoService.isConfigured();
    }

    async getAccounts(): Promise<AccountsSummary> {
        const accounts = await this.monzoService.getAccounts();
        
        if (accounts.length === 0) {
            throw new Error("No Monzo accounts found. Please ensure you have linked your Monzo account.");
        }

        const mappedAccounts = accounts.map(account => ({
            id: account.id,
            description: account.description,
            created: account.created,
        }));

        return { accounts: mappedAccounts };
    }

    async getDashboardData(accountId: string, start: Date, end: Date): Promise<DashboardSummary> {
        const accounts = await this.monzoService.getAccounts();

        if(accounts.length === 0) {
            throw new Error("No Monzo accounts found. Please ensure you have linked your Monzo account.");
        }

        const targetAccountId = accounts.find(account => account.id === accountId)?.id;

        if(!targetAccountId) {
            throw new Error("No valid account ID found. Please ensure your Monzo account is properly linked.");
        }

        const [balance, transactions] = await Promise.all([
            this.monzoService.getBalance(targetAccountId),
            this.monzoService.getTransactions(targetAccountId, start, end),
        ]);

        const { creditTxs, debitTxs } = this.splitTransactionsByCreditDebit(transactions);

        return {  
            balance,
            creditAndDebitOverTimeLineData: this.getSpendingAndIncomeOverTimeLineData(creditTxs, debitTxs),
            creditsByCategoryPieData: this.getSpendingByCategoryPieChart(creditTxs),
            debitsByCategoryPieData: this.getSpendingByCategoryPieChart(debitTxs),
            creditsByDescriptionTreeMap: this.getTreeMapByDescriptionData(creditTxs),
            debitsByDescriptionTreeMap: this.getTreeMapByDescriptionData(debitTxs),
            topDebits: this.getTopDebits(debitTxs),
            topCredits: this.getTopCredits(creditTxs),
            totalDebit: parseFloat(debitTxs.reduce((acc, tx) => { // TODO: clean up to functions and introduce major/minor currecy typing
                return acc + (tx.amount < 0 ? Math.abs(tx.amount) : 0);
            }, 0).toFixed(2)),
            totalCredit: parseFloat(creditTxs.reduce((acc, tx) => {
                return acc + (tx.amount > 0 ? Math.abs(tx.amount) : 0);
            }, 0).toFixed(2)),
        };
    }

      /**
         * TODO: 
         * Pie money by category
         * Line chart of Income over time & Spending over time
         * Top 10 biggest spends by merchant
         * Top 10 biggest spends by category
         */

    // TODO clean up into a 
    private getSpendingAndIncomeOverTimeLineData(creditTxs: MonzoTransaction[], debitTxs: MonzoTransaction[]): CumulativeLineDatum[] {    
        const spendingLine = computeCumulativeLineData(
            "Debits",
            debitTxs,
            (tx) => new Date(tx.created),
            (tx) => Math.abs(tx.amount)
        );
    
        const incomeLine = computeCumulativeLineData(
            "Credits",
            creditTxs,
            (tx) => new Date(tx.created),
            (tx) => Math.abs(tx.amount)
        );
    
        return [spendingLine[0]!, incomeLine[0]!];
    }

    private getTreeMapByDescriptionData(transactions: MonzoTransaction[]): TreemapData {
        const treeMapByDescription = computeTreeMapData(
            transactions,
            (tx) => tx.description ?? "unknown",
            (tx) => Math.abs(tx.amount)
        );
        return treeMapByDescription;
    }

    private getSpendingByCategoryPieChart(transactions: MonzoTransaction[]): PieDatum[] {
        const pieMap = computeGenericPieData(
            transactions,
            (tx) => tx.category ?? 'unknown',
            (tx) => Math.abs(tx.amount)
        )

        return pieMap
    }

    private getTopCredits(transactions: MonzoTransaction[]): TopTransactionsDatum[] {
        return [...transactions]
            .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
            .slice(0, 10)
            .map((tx) => ({
                amount: Math.abs(tx.amount),
                date: new Date(tx.created),
                label: tx.description || 'No description',
            }));
    }

    private getTopDebits(transactions: MonzoTransaction[]): TopTransactionsDatum[] {
        return [...transactions]
            .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
            .slice(0, 10)
            .map((tx) => ({
                amount: Math.abs(tx.amount),
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
}
