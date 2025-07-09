import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('merchant_addresses')
export class MerchantAddressEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    address!: string;

    @Column()
    city!: string;

    @Column()
    country!: string;

    @Column({ type: 'float' })
    latitude!: number;

    @Column({ type: 'float' })
    longitude!: number;

    @Column()
    postcode!: string;

    @Column()
    region!: string;
}
