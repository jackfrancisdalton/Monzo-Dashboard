import type { MonzoTransaction } from "@repo/monzo-types";

export interface CumulativeLineDatum {
    id: string;
    data: { x: string; y: number }[];
}

export const computeCumulativeLineData = (transactions: MonzoTransaction[]): CumulativeLineDatum[] => {
    const sorted = [...transactions].sort(
        (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime()
    );

    let runningTotal = 0;
    const points = sorted.map(tx => {
        runningTotal += Math.abs(tx.amount);
        return {
            x: new Date(tx.created).toLocaleDateString(), // or keep as ISO string
            y: runningTotal
        };
    });

    const response: CumulativeLineDatum[] = [
        {
            id: "Balance Over Time", // TODO clean up
            data: points
        }
    ];

    return response;
};