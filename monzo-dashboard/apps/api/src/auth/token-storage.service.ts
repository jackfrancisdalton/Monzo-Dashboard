import { Injectable, NotImplementedException } from "@nestjs/common";
import { OAuthTokenDTO } from "./dto/oauth-token.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { OauthTokenEntity } from "./entities/oauth-token.entity";
import { Repository } from "typeorm";

@Injectable()
export class TokenStorageService {

    constructor(
        @InjectRepository(OauthTokenEntity) private tokenRepo: Repository<OauthTokenEntity>,
    ) {}
    
    async saveToken(token: OAuthTokenDTO): Promise<void> {
        throw new NotImplementedException("getToken method not implemented");
    }

    async getToken(): Promise<OAuthTokenDTO | null> {
        throw new NotImplementedException("getToken method not implemented");
    }

    async refreshToken(): Promise<void> {
        throw new NotImplementedException("getToken method not implemented");
    }
}