import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { TransactionEntity } from './transaction.entity';


// TODO: for this and all accounts, create an app id as primary key and store the monzo id as another filed (ideally encrypted) 
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
