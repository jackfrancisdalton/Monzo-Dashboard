export interface OAuthTokenDTO {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;  // in seconds
    obtainedAt: Date; 
    provider: string;
}