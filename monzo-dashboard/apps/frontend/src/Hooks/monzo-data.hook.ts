import { useEffect, useState } from "react"
import type { DashboardSummary } from '@repo/dashboard-types';

export const useMonzoData = ({start, end }: { start: Date, end: Date }) => {
    const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary>()

    useEffect(() => {
        const fetchData = async () => {
            const queryParams = new URLSearchParams({
                start: start.toISOString(),
                end: end.toISOString(),
            });

            const res = await fetch(`http://localhost:3000?${queryParams.toString()}`);
            const data: DashboardSummary = await res.json();
            
            setDashboardSummary(data);
        }

        fetchData();
    }, [start, end])

    return { dashboardSummary }
}