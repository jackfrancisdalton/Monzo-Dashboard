import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createCipheriv, createDecipheriv } from "crypto";

@Injectable()
export class TokenCryptoService {
  private readonly algorithm: string;
  private readonly key: Buffer;
  private readonly iv: Buffer;

  constructor(private readonly configService: ConfigService) {
    this.algorithm = this.configService.get<string>('ENCRYPTION_ALGORITHM', 'aes-256-cbc');
    this.key = Buffer.from(this.configService.get<string>('ENCRYPTION_KEY', ''), 'utf8');
    this.iv = Buffer.from(this.configService.get<string>('ENCRYPTION_IV', ''), 'utf8');
  }

  encrypt(token: string): string {
    const cipher = createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decrypt(encryptedToken: string): string {
    const decipher = createDecipheriv(this.algorithm, this.key, this.iv);
    let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}