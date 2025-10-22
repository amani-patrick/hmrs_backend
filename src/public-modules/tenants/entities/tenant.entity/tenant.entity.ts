import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({name: 'tenants'})
export class TenantEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', unique: true, nullable: false, name: 'Name' })
    name: string;

    @Column({ type: 'varchar', unique: true })
    schemaName: string;

    @Column({ type: 'varchar', default: 'active' })
    status: string;

    @Column({ type: 'varchar', nullable: true })
    subscriptionPlan: string;

    @Column({ type: 'varchar', default: 'trial' })
    subscriptionStatus: string;

    @Column({ type: 'timestamp', nullable: true })
    trialStartDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    trialEndDate: Date;

    @Column({ type: 'varchar', nullable: true })
    billingCycle: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updateAt: Date;
}
