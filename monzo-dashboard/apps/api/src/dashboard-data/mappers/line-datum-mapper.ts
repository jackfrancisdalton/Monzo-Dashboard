import { CumulativeLineDatum } from "@repo/dashboard-types";

export function computeCumulativeLineData<T>(
    id: string,
    items: T[],
    dateFn: (item: T) => Date,
    valueFn: (item: T) => number
): CumulativeLineDatum[] {
    const sorted = [...items].sort(
        (a, b) => dateFn(a).getTime() - dateFn(b).getTime()
    );

    let runningTotal = 0;
    const points = sorted.map(item => {
        runningTotal += valueFn(item);
        return {
            x: dateFn(item).toISOString(),
            y: runningTotal
        };
    });

    return [
        {
            id,
            data: points
        }
    ];
}