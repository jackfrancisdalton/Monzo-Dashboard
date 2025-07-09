import { Injectable } from "@nestjs/common";
import { OAuthTokenDTO as OAuthTokensDTO } from "./dto/oauth-token.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { OauthTokenEntity } from "./entities/oauth-token.entity";
import { Repository } from "typeorm";
import { TokenCryptoService } from "./token-crypto.service";

@Injectable()
export class TokenStorageService {

    constructor(
        @InjectRepository(OauthTokenEntity) private tokenRepo: Repository<OauthTokenEntity>,
        private readonly tokenCryptoService: TokenCryptoService
    ) {}
    
    async saveTokens(tokens: OAuthTokensDTO): Promise<void> {
        const tokenEntity = this.tokenRepo.create({
            provider: tokens.provider,
            encryptedAccessToken: this.tokenCryptoService.encrypt(tokens.accessToken),
            encryptedRefreshToken: this.tokenCryptoService.encrypt(tokens.refreshToken),
            expiresIn: tokens.expiresIn,
            obtainedAt: tokens.obtainedAt,
        });

        console.log('stored', tokenEntity)
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
}