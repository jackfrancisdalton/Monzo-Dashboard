import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { TransactionEntity } from './transaction.entity';

@Entity('accounts')
export class AccountEntity {
    @PrimaryColumn()
    id!: string;

    @Column()
    description!: string;

    @Column()
    created!: Date;

    @OneToMany(() => TransactionEntity, transaction => transaction.account)
    transactions!: TransactionEntity[];
}
