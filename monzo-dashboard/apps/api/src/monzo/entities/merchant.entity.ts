import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { MerchantAddressEntity } from './merchant-address.entity';

@Entity('merchants')
export class MerchantEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @Column()
  category!: string;

  @Column({ nullable: true })
  emoji!: string;

  @Column({ nullable: true })
  logo!: string;

  @Column()
  created!: Date;

  @CreateDateColumn()
  fetchedAt!: Date;

  @OneToOne(() => MerchantAddressEntity, { cascade: true, nullable: true })
  @JoinColumn()
  address!: MerchantAddressEntity;
}
