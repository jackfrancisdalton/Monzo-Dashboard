import type { MonzoTransaction } from "@repo/monzo-types";

export interface TreemapNode {
    name: string;
    value: number;
}

export interface TreemapData {
    name: string;
    children: TreemapNode[];
}

export const computeTreeMapData = (transactions: MonzoTransaction[]): TreemapData => {
    const totals = new Map<string, number>();

    for (const tx of transactions) {
        const name = tx.merchant?.name || "unknown";
        const current = totals.get(name) || 0;
        totals.set(name, current + Math.abs(tx.amount)); // use absolute to show spending
    }

    const children = Array.from(totals.entries()).map(([name, total]) => ({
        name,
        value: total,
    }));

    return {
        name: "Transactions", // TODO clean up
        children,
    };
};