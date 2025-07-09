import { Controller, Get, Param, Query, Res, NotFoundException } from "@nestjs/common";
import { type Response } from "express";
import { TokenStorageService } from "./token-storage.service";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { ConfigService } from '@nestjs/config';
import { buildOAuthProvidersConfig } from "./oauth.providers";

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
    @Res() res: Response
  ) {
    const oAuthConfigs = buildOAuthProvidersConfig(this.configService);
    const providerConfig = oAuthConfigs[provider];

    if (!providerConfig) {
      throw new NotFoundException(`Provider "${provider}" is not configured.`);
    }

    return res.redirect(
      `${providerConfig.authUrl}?client_id=${providerConfig.clientId}&redirect_uri=${encodeURIComponent(providerConfig.redirectUri)}&response_type=code`
    );
  }

  @Get(':provider/callback')
  async handleCallback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Res() res: Response
  ) {
    const oAuthConfigs = buildOAuthProvidersConfig(this.configService);
    const providerConfig = oAuthConfigs[provider];

    if (!providerConfig) {
      throw new NotFoundException(`Provider "${provider}" is not configured.`);
    }

    if (!providerConfig) {
      throw new NotFoundException(`Provider "${provider}" not configured.`);
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

    if (!response || !response.data) {
      throw new Error(`Failed to retrieve token data from ${provider} API.`);
    }

    const data = response.data;

    // TODO: store token
    // await this.tokenStorage.saveTokens({
    //   provider,
    //   accessToken: data.access_token,
    //   refreshToken: data.refresh_token,
    //   expiresIn: data.expires_in,
    //   obtainedAt: new Date(),
    // });

    // TODO: replace with const
    return res.redirect(`http://localhost:5173/dashboard?connected=${provider}`);
  }
}
