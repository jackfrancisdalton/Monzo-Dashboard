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
    address?: MonzoMerchantAddress;
}
  
export interface MonzoMerchantAddress {
    address: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    postcode: string;
    region: string;
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