import { Injectable, NotImplementedException } from "@nestjs/common";
import { OAuthTokenDTO as OAuthTokensDTO } from "./dto/oauth-token.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { OauthTokenEntity } from "./entities/oauth-token.entity";
import { Repository } from "typeorm";

@Injectable()
export class TokenStorageService {

    constructor(
        @InjectRepository(OauthTokenEntity) private tokenRepo: Repository<OauthTokenEntity>,
    ) {}
    
    async saveTokens(tokens: OAuthTokensDTO): Promise<void> {
        throw new NotImplementedException("getToken method not implemented");
    }

    async getTokens(): Promise<OAuthTokensDTO | null> {
        throw new NotImplementedException("getToken method not implemented");
    }

    async refreshTokens(): Promise<void> {
        throw new NotImplementedException("getToken method not implemented");
    }
}