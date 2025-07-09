import { Module } from '@nestjs/common';
import { TokenStorageService } from './token-storage.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OauthTokenEntity } from './entities/oauth-token.entity';
import { OAuthController } from './oauth.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forFeature([OauthTokenEntity]),
        HttpModule,
        ConfigModule
    ],
    providers: [TokenStorageService],
    controllers: [OAuthController],
    exports: [TokenStorageService],
})
export class AuthModule {}
