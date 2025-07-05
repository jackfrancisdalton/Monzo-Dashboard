import type { MonzoAccount, MonzoBalance } from "@repo/monzo-types";

export interface CumulativeLineDatum {
    id: string;
    data: { x: string; y: number }[];
}

export interface PieDatum {
    id: string;
    label: string;
    value: number;
}

export interface TreemapNode {
    name: string;
    value: number;
}

export interface TreemapData {
    name: string;
    children: TreemapNode[];
}

export interface TopTransactionsDatum {
    description: string;
    amount: number;
    created: string;
    merchantName?: string;
}

export interface DashboardSummary {
    accounts: MonzoAccount[];
    balance: MonzoBalance;
    spendingOverTimeLineData: CumulativeLineDatum[];
    spendingByCategoryPieData: PieDatum[];
    spendingByMerchantTreeMap: TreemapData;
    topTransactions: {
        description: string;
        amount: number;
        created: string;
        merchantName?: string;
    }[];
    totalSpending: number;
}