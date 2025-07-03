export interface MonzoTransaction {
    id: string;
    amount: number;
    created: string;
    currency: string;
    description: string;
    category: string;
    merchant?: MonzoMerchant;
    settled?: string;
    notes?: string;
}
  
export interface MonzoMerchant {
    id: string;
    name: string;
    category: string;
    logo?: string;
    emoji?: string;
}
  
export interface MonzoAccount {
    id: string;
    description: string;
    created: string;
}

export interface MonzoBalance {
    balance: number;
    currency: string;
    spend_today: number;
}