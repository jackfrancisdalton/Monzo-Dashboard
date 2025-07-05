import { TreemapData } from "@repo/chart-data-types";

export function computeTreeMapData<T>(
    items: T[],
    groupFn: (item: T) => string,
    valueFn: (item: T) => number
): TreemapData {
    const totals = new Map<string, number>();

    for (const item of items) {
        const key = groupFn(item);
        const current = totals.get(key) || 0;
        totals.set(key, current + valueFn(item));
    }

    const children = Array.from(totals.entries()).map(([name, total]) => ({
        name,
        value: total,
    }));

    return {
        name: "Root",
        children,
    };
}