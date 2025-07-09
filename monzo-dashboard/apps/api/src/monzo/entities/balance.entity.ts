import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  CreateDateColumn, 
  JoinColumn 
} from 'typeorm';
import { AccountEntity } from './account.entity';

@Entity('balances')
export class BalanceEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    accountId!: string;

    @ManyToOne(() => AccountEntity, account => account.id)
    @JoinColumn({ name: 'accountId' })
    account!: AccountEntity;

    @Column()
    balance!: number;

    @Column()
    total_balance!: number;

    @Column()
    spend_today!: number;

    @Column()
    currency!: string;

    @CreateDateColumn()
    fetchedAt!: Date;
}
