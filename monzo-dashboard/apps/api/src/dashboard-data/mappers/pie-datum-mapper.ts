import { PieDatum } from "@repo/dashboard-types";

export function computeGenericPieData<T>(
    items: T[],
    groupFn: (item: T) => string,
    valueFn: (item: T) => number
): PieDatum[] {
    const totals = items.reduce((acc, item) => {
        const key = groupFn(item);
        if (!acc[key]) {
            acc[key] = { id: key, label: key, value: 0 };
        }
        acc[key].value += valueFn(item);
        return acc;
    }, {} as Record<string, PieDatum>);

    return Object.values(totals);
}