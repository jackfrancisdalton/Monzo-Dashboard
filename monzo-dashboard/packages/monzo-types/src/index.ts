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

// Types and interfaces for SSE update events on monzo sync
export type MonzoSyncTaskName = 'fullSync' | 'accounts' | 'transactions' | 'balances';
export type MonzoSyncTaskStage = 'start' | 'progress' | 'completed';

export interface MonzoSyncProgressUpdate {
    taskName: MonzoSyncTaskName;
    taskStage: MonzoSyncTaskStage;
    syncedCount?: number;
}

export interface MonzoSyncProgressUpdateEvent {
    data: MonzoSyncProgressUpdate;
}