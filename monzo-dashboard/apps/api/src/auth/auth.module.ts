import { Module } from '@nestjs/common';
import { TokenStorageService } from './token-storage.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OauthTokenEntity } from './entities/oauth-token.entity';
import { AuthController } from './auth.controller';

@Module({
    imports: [TypeOrmModule.forFeature([OauthTokenEntity])],
    controllers: [AuthController],
    exports: [TokenStorageService],
})
export class AuthModule {}
