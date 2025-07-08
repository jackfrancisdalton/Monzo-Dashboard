import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'oauth_tokens' })
export class OauthTokenEntity {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  provider!: string; // storing in case we want ti support multiple providers in future (barclays/TSB/etc...)

  @Column({ type: 'text' })
  encryptedAccessToken!: string;

  @Column({ type: 'text' })
  encryptedRefreshToken!: string;

  @Column({ type: 'int' })
  expiresIn!: number; // in seconds

  @Column({ type: 'timestamp' })
  obtainedAt!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
