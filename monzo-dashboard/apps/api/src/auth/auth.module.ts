import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OauthTokenEntity } from './entities/oauth-token.entity';
import { HttpModule } from '@nestjs/axios';
import { TokenStorageService } from './token-storage.service';
import { OAuthController } from './oauth.controller';
import { TokenCryptoService } from './token-crypto.service';

@Module({})
export class AuthModule {
    static register(): DynamicModule {

        // We don't use tokens or oauth if we're using mock data
        if (process.env.USE_REAL_MONZO_API !== 'true') {
            return {
                module: AuthModule,
                providers: [],
                controllers: [],
                exports: [],
                imports: [],
            };
        }
        
        return {
            module: AuthModule,
            imports: [
                TypeOrmModule.forFeature([OauthTokenEntity]),
                HttpModule,
            ],
            providers: [TokenStorageService, TokenCryptoService],
            controllers: [OAuthController],
            exports: [TokenStorageService],
        };
    }
}
