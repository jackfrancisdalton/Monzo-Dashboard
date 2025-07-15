export class MonzoAuthMissingException extends Error {
    constructor(message = 'No Monzo access token found') {
      super(message);
      this.name = 'MonzoAuthMissingException';
    }
}
  
export class MonzoApiException extends Error {
    constructor(public readonly details: any, message = 'Monzo API failed') {
      super(message);
      this.name = 'MonzoApiException';
    }
}

export class MonzoBalanceNotFoundException extends Error {
  constructor() {
    super(`No Monzo balances found.`);
    this.name = 'MonzoBalanceNotFoundException';
  }
}

export class MonzoAccountNotFoundException extends Error {
  constructor(private readonly accountId?: string) {
    super(accountId ? `No Monzo Accounts found matching ${accountId}.` : `No Monzo Account found.`);
    this.name = 'MonzoBalanceNotFoundException';
  }
}