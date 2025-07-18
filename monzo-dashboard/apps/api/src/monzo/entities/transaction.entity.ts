import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { AccountEntity } from './account.entity';
import { MerchantEntity } from './merchant.entity';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  accountId!: string;

  @ManyToOne(() => AccountEntity, account => account.transactions)
  @JoinColumn({ name: 'accountId' })
  account!: AccountEntity;

  @Column()
  amount!: number;

  @Column()
  currency!: string;

  @Column()
  description!: string;

  @Column()
  created!: Date;

  @Column()
  category!: string;

  // Merchant data seems to be optonal in some cases, so reflecting that here
  @ManyToOne(() => MerchantEntity, { nullable: true })
  @JoinColumn({ name: 'merchantId' })
  merchant?: MerchantEntity;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any>;

  @Column()
  notes!: string;

  @Column()
  is_load!: boolean;

  @Column({ nullable: true })
  settled!: Date;
}
