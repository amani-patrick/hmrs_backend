import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('certifications')
export class Certification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column()
  name: string;

  @Column()
  category: string;

  @Column()
  validPeriod: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  totalEmployees: number;

  @Column({ type: 'int', default: 0 })
  certified: number;

  @Column({ type: 'int', default: 0 })
  expiring: number;

  @Column({ type: 'int', default: 0 })
  expired: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastUpdated: Date;

  constructor(partial?: Partial<Certification>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
