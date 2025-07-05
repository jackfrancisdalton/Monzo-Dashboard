import { CumulativeLineDatum } from "../../../../../packages/dashboard-types/src";

export function computeCumulativeLineData<T>(
    items: T[],
    dateFn: (item: T) => string | Date,
    valueFn: (item: T) => number
): CumulativeLineDatum[] {
    const sorted = [...items].sort(
        (a, b) => new Date(dateFn(a)).getTime() - new Date(dateFn(b)).getTime()
    );

    let runningTotal = 0;
    const points = sorted.map(item => {
        runningTotal += valueFn(item);
        return {
            x: new Date(dateFn(item)).toLocaleDateString(),
            y: runningTotal
        };
    });

    return [
        {
            id: "Cumulative Over Time",
            data: points
        }
    ];
}