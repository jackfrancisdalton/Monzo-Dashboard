export class OAuthProviderNotConfiguredException extends Error {
    constructor(provider: string) {
        super(`OAuth provider "${provider}" is not configured.`);
        this.name = "OAuthProviderNotConfiguredException";
    }
}

export class InvalidOAuthStateException extends Error {
    constructor(state: string) {
        super(`Failed to parse OAuth state parameter: "${state}".`);
        this.name = "InvalidOAuthStateException";
    }
}

export class NoRefreshTokenStoredException extends Error {
    constructor(provider: string) {
        super(`No refresh token stored for provider "${provider}". Cannot refresh tokens.`);
        this.name = "NoRefreshTokenStoredException";
    }
}