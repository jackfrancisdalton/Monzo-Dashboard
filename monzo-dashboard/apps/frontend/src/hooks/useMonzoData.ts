import { useEffect, useState } from "react";
import type { AccountsSummary, DashboardSummary } from '@repo/dashboard-types';
import type { MonzoAccount } from "@repo/monzo-types";

export const useMonzoData = ({ start, end }: { start: Date, end: Date }) => {
    const [accounts, setAccounts] = useState<MonzoAccount[]>([]); // TODO: may wish to remove monzo types
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary>();

    // Fetch accounts on first load
    useEffect(() => {
        const fetchAccounts = async () => {
            const res = await fetch(`http://localhost:3000/dashboard-data/accounts`);
            const data: AccountsSummary = await res.json();
            setAccounts(data.accounts);

            if (data.accounts.length && !selectedAccount) {
                setSelectedAccount(data.accounts[0].id); // auto select first account
            }
        };
        fetchAccounts();
    }, []);

    // Fetch dashboard summary whenever selectedAccount or date range changes
    useEffect(() => {
        if (!selectedAccount) // if no account is selected, do not fetch data
            return;

        const fetchData = async () => {
            const queryParams = new URLSearchParams({
                start: start.toISOString(),
                end: end.toISOString(),
                accountId: selectedAccount
            });

            const res = await fetch(`http://localhost:3000/dashboard-data/data?${queryParams.toString()}`);
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
