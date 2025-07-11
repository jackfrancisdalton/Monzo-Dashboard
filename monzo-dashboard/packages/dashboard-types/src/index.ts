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
    label: string;
    amount: number;
    date: Date;
}

export interface DashboardSummary {
    balance: MonzoBalance;
    totalCredit: number;
    totalDebit: number;

    // Line Charts
    creditAndDebitOverTimeLineData: CumulativeLineDatum[];

    // Pie Charts
    creditsByCategoryPieData: PieDatum[];
    debitsByCategoryPieData: PieDatum[];

    // Tree Charts
    creditsByDescriptionTreeMap: TreemapData;
    debitsByDescriptionTreeMap: TreemapData;

    // Top Entity Cards
    topDebits: TopTransactionsDatum[];
    topCredits: TopTransactionsDatum[];
}

export interface AccountsSummary {
    accounts: MonzoAccount[];
}
