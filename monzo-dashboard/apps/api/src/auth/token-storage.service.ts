import { Injectable } from "@nestjs/common";
import { OAuthTokenDTO as OAuthTokensDTO } from "./dto/oauth-token.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { OauthTokenEntity } from "./entities/oauth-token.entity";
import { Repository } from "typeorm";
import { TokenCryptoService } from "./token-crypto.service";
import { buildOAuthProvidersConfig } from "./oauth.providers";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { NoRefreshTokenStoredException, OAuthProviderNotConfiguredException } from "./auth.exceptions";

@Injectable()
export class TokenStorageService {

    constructor(
        @InjectRepository(OauthTokenEntity) private tokenRepo: Repository<OauthTokenEntity>,
        private readonly tokenCryptoService: TokenCryptoService,
        private readonly configService: ConfigService,
        private readonly httpService: HttpService
    ) {}
    
    async saveTokens(tokens: OAuthTokensDTO): Promise<void> {
        const tokenEntity = this.tokenRepo.create({
            provider: tokens.provider,
            encryptedAccessToken: this.tokenCryptoService.encrypt(tokens.accessToken),
            encryptedRefreshToken: this.tokenCryptoService.encrypt(tokens.refreshToken),
            expiresIn: tokens.expiresIn,
            obtainedAt: tokens.obtainedAt,
        });

        await this.tokenRepo.save(tokenEntity);
    }

    async getTokens(provider: string): Promise<OAuthTokensDTO | null> {
        const tokenEntity = await this.tokenRepo.findOneBy({ provider });
        
        if (!tokenEntity) {
            return null;
        }
        
        return {
            accessToken: this.tokenCryptoService.decrypt(tokenEntity.encryptedAccessToken),
            refreshToken: this.tokenCryptoService.decrypt(tokenEntity.encryptedRefreshToken),
            expiresIn: tokenEntity.expiresIn,
            obtainedAt: tokenEntity.obtainedAt,
            provider: tokenEntity.provider,
        };
    }

    async refreshTokens(provider: string): Promise<OAuthTokensDTO> {
        const existing = await this.getTokens(provider);
        
        if (!existing?.refreshToken) {
            throw new NoRefreshTokenStoredException(provider);
        }

        const oAuthConfigs = buildOAuthProvidersConfig(this.configService);
        const providerConfig = oAuthConfigs[provider];
        if (!providerConfig) {
            throw new OAuthProviderNotConfiguredException(provider);
        }

        const response = await firstValueFrom(
            this.httpService.post(
                providerConfig.tokenUrl,
                new URLSearchParams({
                    grant_type: 'refresh_token',
                    client_id: providerConfig.clientId,
                    client_secret: providerConfig.clientSecret,
                    refresh_token: existing.refreshToken,
                }),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            )
        );

        const data = response.data;

        const updatedTokens: OAuthTokensDTO = {
            provider,
            accessToken: data.access_token,
            refreshToken: data.refresh_token ?? existing.refreshToken,
            expiresIn: data.expires_in,
            obtainedAt: new Date(),
        };

        await this.saveTokens(updatedTokens);
        return updatedTokens;
    }
}