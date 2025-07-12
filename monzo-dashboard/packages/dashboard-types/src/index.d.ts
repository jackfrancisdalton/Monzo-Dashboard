import type { MonzoAccount, MonzoBalance } from "@repo/monzo-types";
export interface CumulativeLineDatum {
    id: string;
    data: {
        x: string;
        y: number;
    }[];
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
    creditAndDebitOverTimeLineData: CumulativeLineDatum[];
    creditsByCategoryPieData: PieDatum[];
    debitsByCategoryPieData: PieDatum[];
    creditsByDescriptionTreeMap: TreemapData;
    debitsByDescriptionTreeMap: TreemapData;
    topDebits: TopTransactionsDatum[];
    topCredits: TopTransactionsDatum[];
}
export interface AccountsSummary {
    accounts: MonzoAccount[];
}
//# sourceMappingURL=index.d.ts.map