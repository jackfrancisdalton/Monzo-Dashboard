import { Controller, Get, Param, Query, Res, NotFoundException } from "@nestjs/common";
import { type Response } from "express";
import { TokenStorageService } from "./token-storage.service";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { ConfigService } from '@nestjs/config';
import { buildOAuthProvidersConfig } from "./oauth.providers";
import { randomBytes } from "crypto";
import { InvalidOAuthStateException, OAuthProviderNotConfiguredException } from "./auth.exceptions";

@Controller('auth')
export class OAuthController {
  constructor(
    private readonly httpService: HttpService,
    private readonly tokenStorage: TokenStorageService,
    private readonly configService: ConfigService
  ) {}

  @Get(':provider/login')
  redirectToProvider(
    @Param('provider') provider: string,
    @Query('redirect_uri') redirectUri: string,
    @Res() res: Response
  ) {
    const oAuthConfigs = buildOAuthProvidersConfig(this.configService);
    const providerConfig = oAuthConfigs[provider];

    if (!providerConfig) {
      throw new OAuthProviderNotConfiguredException(provider);
  }

    // We pass the redirect specfied in the frontend as a state parameter, then use it in the callback method, 
    // so that we can target a specific frontend page as the terminating page for the oauth flow.
    const statePayload = {
      nonce: randomBytes(8).toString('hex'),
      frontend_redirect_uri: redirectUri
    };

    const state = Buffer.from(JSON.stringify(statePayload)).toString('base64url');

    const queryParams = new URLSearchParams({
      client_id: providerConfig.clientId,
      redirect_uri: providerConfig.redirectUri,
      response_type: 'code',
      state: state,
    });
    let url = `${providerConfig.authUrl}?${queryParams.toString()}`;

    if (providerConfig.scopes.length > 0) {
      const scopeParam = encodeURIComponent(providerConfig.scopes.join(' '));
      url += `&scope=${scopeParam}`;
    }

    return res.redirect(url);
  }

  @Get(':provider/callback')
  async handleCallback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response
  ) {
    const oAuthConfigs = buildOAuthProvidersConfig(this.configService);
    const providerConfig = oAuthConfigs[provider];

    if (!providerConfig) {
      throw new OAuthProviderNotConfiguredException(provider);
    }

    let stateData: { nonce: string; frontend_redirect_uri: string } = { 
      nonce: '', 
      frontend_redirect_uri: providerConfig.redirectUri  
    };

    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    } catch (err) {
      throw new InvalidOAuthStateException(state);
    }

    const response = await firstValueFrom(
      this.httpService.post(
        providerConfig.tokenUrl,
        new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: providerConfig.clientId,
          client_secret: providerConfig.clientSecret,
          redirect_uri: providerConfig.redirectUri,
          code,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      )
    );

    const data = response.data;

    await this.tokenStorage.saveTokens({
      provider,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      obtainedAt: new Date(),
    });

    // Redirects to to the original redirect URI provided by the frontend
    return res.redirect(`${stateData.frontend_redirect_uri}`);
  }
}
