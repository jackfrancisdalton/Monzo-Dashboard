import { Module } from '@nestjs/common';
import { TokenStorageService } from './token-storage.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OauthTokenEntity } from './entities/oauth-token.entity';

@Module({
    imports: [TypeOrmModule.forFeature([OauthTokenEntity])],
    exports: [TokenStorageService],
})
export class AuthModule {}
