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

    async getDashboardData(start: Date, end: Date): Promise<DashboardSummary> {


        console.log(`Fetching dashboard data for range: ${start} to ${end}`);

        const [accounts, balance, transactions] = await Promise.all([
            this.monzoService.getAccounts(),
            this.monzoService.getBalance(),
            this.monzoService.getTransactions(start, end),
        ]);

        return { 
            accounts, 
            balance,
            spendingOverTimeLineData: this.getSpendingOverTimeLineData(transactions),
            spendingByCategoryPieData: this.getSpendingByCategoryPieChart(transactions),
            spendingByMerchantTreeMap: this.getTreeMapByMerchantData(transactions),
            topTransactions: this.getTopTransactions(transactions),
            totalSpending: transactions.reduce((acc, transaction) => {
                return acc + (transaction.amount < 0 ? Math.abs(transaction.amount) : 0);
            }, 0),
        };
    }

    private getSpendingOverTimeLineData(transactions: MonzoTransaction[]): CumulativeLineDatum[] {
        const lineData = computeCumulativeLineData(
            transactions,
            (tx) => tx.created,
            (tx) => Math.abs(tx.amount)
        );
        return lineData;
    }

    private getTreeMapByMerchantData(transactions: MonzoTransaction[]): TreemapData {
        const treeMapByMerchant = computeTreeMapData(
            transactions,
            (tx) => tx.merchant?.name ?? "unknown",
            (tx) => Math.abs(tx.amount)
        );
        return treeMapByMerchant;
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
