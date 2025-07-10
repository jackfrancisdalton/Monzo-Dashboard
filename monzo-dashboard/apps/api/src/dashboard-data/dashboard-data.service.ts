import { Injectable } from '@nestjs/common';
import { CumulativeLineDatum, DashboardSummary, PieDatum, TopTransactionsDatum, TreemapData } from '../../../../packages/dashboard-types/src';
import { MonzoTransaction } from '@repo/monzo-types';
import { MonzoService } from 'src/monzo/monzo-service.interface';
import { computeCumulativeLineData } from './mappers/line-datum-mapper';
import { computeTreeMapData } from './mappers/tree-map-data-mapper';
import { computeGenericPieData } from './mappers/pie-datum-mapper';

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

    async getDashboardData(start: Date, end: Date): Promise<DashboardSummary> {
        const accounts = await this.monzoService.getAccounts();

        if(accounts.length === 0) {
            throw new Error("No Monzo accounts found. Please ensure you have linked your Monzo account.");
        }

        // TODO: clean up should be clear to TS from above that these cannot be null, but oh well.
        // TODO: clean up, currently setting this while default account choice not supported as this is my main account 
        const targetAccountId = accounts[1]?.id;
        if(!targetAccountId) {
            throw new Error("No valid account ID found. Please ensure your Monzo account is properly linked.");
        }

        const [balance, transactions] = await Promise.all([
            this.monzoService.getBalance(targetAccountId),
            this.monzoService.getTransactions(targetAccountId, start, end),
        ]);

        return { 
            accounts, 
            balance,
            spendingOverTimeLineData: this.getSpendingOverTimeLineData(transactions),
            spendingByCategoryPieData: this.getSpendingByCategoryPieChart(transactions),
            spendingByDescriptionTreeMap: this.getTreeMapByDescriptionData(transactions),
            topTransactions: this.getTopTransactions(transactions),
            totalSpending: transactions.reduce((acc, transaction) => {
                return acc + (transaction.amount < 0 ? Math.abs(transaction.amount) : 0);
            }, 0),
        };
    }

    // TODO clean up into a 
    private getSpendingOverTimeLineData(transactions: MonzoTransaction[]): CumulativeLineDatum[] {
        const lineData = computeCumulativeLineData(
            transactions,
            (tx) => tx.created,
            (tx) => Math.abs(tx.amount)
        );
        return lineData;
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

    private getTopTransactions(transactions: MonzoTransaction[]): TopTransactionsDatum[] {
        return [...transactions]
            .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
            .slice(0, 10)
            .map((tx) => ({
                id: tx.id,
                amount: Math.abs(tx.amount),
                date: new Date(tx.created).toLocaleDateString(),
                merchant: tx.merchant?.name ?? 'unknown',
                description: tx.description || 'No description',
                category: tx.category || 'unknown',
                created: new Date(tx.created).toLocaleDateString(),
            }));
    }
}
