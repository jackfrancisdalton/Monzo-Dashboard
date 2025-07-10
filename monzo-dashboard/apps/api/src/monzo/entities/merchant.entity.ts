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

  @Column({ nullable: true }) // Monzo API sometimes returns NA:NA:NA for created, so we have to suppot null created dates
  created!: Date;

  @CreateDateColumn()
  fetchedAt!: Date;

  @OneToOne(() => MerchantAddressEntity, { cascade: true, nullable: true })
  @JoinColumn()
  address!: MerchantAddressEntity;
}
