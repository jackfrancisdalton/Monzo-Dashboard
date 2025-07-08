import { Controller, Get, Query, Res } from "@nestjs/common";
import { type Response } from "express";
import { TokenStorageService } from "./token-storage.service";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly httpService: HttpService,
        private readonly tokenStorage: TokenStorageService
    ) {}

    @Get('login')
    redirectToMonzo(@Res() res: Response) {
        // TODO: define these variables
        const clientId = process.env.MONZO_CLIENT_ID;
        const redirectUri = process.env.MONZO_REDIRECT_URI;

        if (!redirectUri || !clientId) {
            throw new Error('Missing required environment variables for Monzo authentication.');
        }

        return res.redirect(
            `https://auth.monzo.com/?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`
        );
    }

    @Get('callback')
    async handleCallback(
        @Query('code') code: string,
        @Res() res: Response
    ) {
        // TODO: define these variables
        const clientId = process.env.MONZO_CLIENT_ID;
        const clientSecret = process.env.MONZO_CLIENT_SECRET;
        const redirectUri = process.env.MONZO_REDIRECT_URI;

        if (!clientId || !clientSecret || !redirectUri) {
            throw new Error('Missing required environment variables for Monzo authentication.');
        }

        const response = await firstValueFrom(
            this.httpService.post(
                'https://api.monzo.com/oauth2/token',
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: redirectUri,
                    code,
                }),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            )
        );

        if (!response || !response.data) {
            throw new Error('Failed to retrieve data from Monzo API.');
        }

        const data = response.data;

        await this.tokenStorage.saveTokens({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
            obtainedAt: new Date(),
        });

        return res.send('Authentication successful! You can close this window.');
    }
}
