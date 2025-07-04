import type { MonzoTransaction } from "@repo/monzo-types";

export interface PieDatum {
    id: string;
    label: string;
    value: number;
}

export function computePieData(transactions: MonzoTransaction[]): PieDatum[] {
    const totals = transactions.reduce((acc, tx) => {
      const category = tx.category ?? 'unknown';
      if (!acc[category]) {
        acc[category] = { id: category, label: category, value: 0 };
      }
      acc[category].value += Math.abs(tx.amount);
      return acc;
    }, {} as Record<string, PieDatum>);
  
    return Object.values(totals);
}