export class NoAccountsConfiguredException extends Error {
    constructor() {
        super("No accounts found. Please ensure you have linked and synced your bank account(s).");
        this.name = "NoAccountsConfiguredException";
    }
}

export class InvalidAccountIdException extends Error {
    constructor(accountId: string) {
        super(`No valid account ID found for '${accountId}'. Please ensure your accounts is linked and synced.`);
        this.name = "InvalidAccountIdException";
    }
}
