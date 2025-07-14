import { useCallback, useEffect, useState } from "react";
import type { AccountsSummary, DashboardSummary } from '@repo/dashboard-types';
import type { MonzoAccount } from "@repo/monzo-types";

const API_URL = import.meta.env.VITE_API_URL;

export const useMonzoData = ({ start, end }: { start: Date, end: Date }) => {
    // TECHDEBT: may wish to remove monzo types from frontend as they should really only be relevant on backend
    const [accounts, setAccounts] = useState<MonzoAccount[]>([]); 
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary>();
    const [loadingData, setLoadingData] = useState<boolean>(false);

    useEffect(() => {
        fetchAccounts();
    }, []);

    useEffect(() => {
        fetchDashboardSummary();
    }, [start, end, selectedAccount]);

    const fetchAccounts = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/dashboard-data/accounts`);
            
            if (!res.ok) {
                throw new Error(`Failed to fetch accounts: ${res.status} ${res.statusText}`);
            }

            const data: AccountsSummary = await res.json();
            setAccounts(data.accounts);

            // auto select first account if non specified
            if (data.accounts.length && !selectedAccount) {
                setSelectedAccount(data.accounts[0].id); 
            }
        } catch (error) {
            console.error("Error fetching accounts:", error);
            setAccounts([]);
        }
    }, []);

    const fetchDashboardSummary = useCallback(async () => {
        if (!selectedAccount)
            return;

        setLoadingData(true);

        try {
            const queryParams = new URLSearchParams({
                start: start.toISOString(),
                end: end.toISOString(),
                accountId: selectedAccount
            });

            const res = await fetch(`${API_URL}/dashboard-data/data?${queryParams.toString()}`);
            
            if (!res.ok) {
                throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
            }

            const data: DashboardSummary = await res.json();
            setDashboardSummary(data);
        } catch (error) {
            console.error("Error fetching dashboard summary:", error);
            setDashboardSummary(undefined);
        } finally {
            setLoadingData(false);
        }
    }, [start, end, selectedAccount]);

    return {
        accounts,
        selectedAccount,
        setSelectedAccount,
        dashboardSummary,
        loadingData
    };
};
