import { useEffect, useState } from "react";
import type { AccountsSummary, DashboardSummary } from '@repo/dashboard-types';
import type { MonzoAccount } from "@repo/monzo-types";

const API_URL = import.meta.env.VITE_API_URL;

export const useMonzoData = ({ start, end }: { start: Date, end: Date }) => {
    const [accounts, setAccounts] = useState<MonzoAccount[]>([]); // TECHDEBT: may wish to remove monzo types
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary>();

    // Fetch accounts on first load
    useEffect(() => {
        const fetchAccounts = async () => {
            const res = await fetch(`${API_URL}/dashboard-data/accounts`);
            const data: AccountsSummary = await res.json();
            setAccounts(data.accounts);

            // auto select first account if non specified
            if (data.accounts.length && !selectedAccount) {
                setSelectedAccount(data.accounts[0].id); 
            }
        };
        fetchAccounts();
    }, []);

    // Fetch dashboard summary whenever selectedAccount or date range changes
    useEffect(() => {
        if (!selectedAccount)
            return;

        const fetchData = async () => {
            const queryParams = new URLSearchParams({
                start: start.toISOString(),
                end: end.toISOString(),
                accountId: selectedAccount
            });

            const res = await fetch(`${API_URL}/dashboard-data/data?${queryParams.toString()}`);
            const data: DashboardSummary = await res.json();
            setDashboardSummary(data);
        };

        fetchData();
    }, [start, end, selectedAccount]);

    return {
        accounts,
        selectedAccount,
        setSelectedAccount,
        dashboardSummary
    };
};
