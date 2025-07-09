import { ConfigService } from "@nestjs/config";

export interface OAuthProviderConfig {
    authUrl: string;
    tokenUrl: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}

export function buildOAuthProvidersConfig(configService: ConfigService): Record<string, OAuthProviderConfig> {
    return {
      monzo: {
        authUrl: 'https://auth.monzo.com/',
        tokenUrl: 'https://api.monzo.com/oauth2/token',
        clientId: configService.get<string>('MONZO_CLIENT_ID', ''),
        clientSecret: configService.get<string>('MONZO_CLIENT_SECRET', ''),
        redirectUri: configService.get<string>('MONZO_REDIRECT_URI', ''),
      },
      // more providers...
    };
  }