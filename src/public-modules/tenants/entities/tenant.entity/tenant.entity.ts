import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({name: 'tenants'})
export class TenantEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', unique: true, nullable: false })
    Name: string;

    @Column({ type: 'varchar', unique: true })
    schemaName: string;

    @Column({ type: 'varchar', default: 'active' })
    status: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updateAt: Date;
}
