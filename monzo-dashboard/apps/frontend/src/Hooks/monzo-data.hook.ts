import { useEffect, useState } from "react"
import type { MonzoAccount, MonzoBalance, MonzoTransaction } from '@repo/monzo-types';


export const useMonzoData = () => {
    const [balance, setBalance] = useState<MonzoBalance>()
    const [accounts, setAccounts] = useState<MonzoAccount[]>();
    const [transactions, setTransactions] = useState<MonzoTransaction[]>();

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch('http://localhost:3000');
            const data = res.body;
            console.log(data);
        }

        fetchData();
    }, [])

    return { 
        balance, setBalance,
        accounts, setAccounts,
        transactions, setTransactions
    }
}