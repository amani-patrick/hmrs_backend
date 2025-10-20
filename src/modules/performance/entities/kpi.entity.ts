import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum KpiType {
  QUANTITATIVE = 'quantitative',
  QUALITATIVE = 'qualitative',
  BOOLEAN = 'boolean',
}

export enum KpiFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
}

export enum KpiStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
}

@Entity({ name: 'kpis' })
@Index(['tenantId', 'departmentId'])
@Index(['tenantId', 'status'])
export class KPI {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: KpiType })
  type: KpiType;

  @Column({ type: 'enum', enum: KpiStatus, default: KpiStatus.ACTIVE })
  status: KpiStatus;

  @Column({ nullable: true })
  category: string | null;

  @Column({ nullable: true })
  departmentId: string | null;

  @Column({ nullable: true })
  unit: string | null; // e.g., '%', 'units', 'hours'

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  target: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  threshold: number | null; // Minimum acceptable value

  @Column({ type: 'enum', enum: KpiFrequency })
  frequency: KpiFrequency;

  @Column({ type: 'text', nullable: true })
  formula: string | null; // Calculation formula

  @Column({ type: 'jsonb', nullable: true })
  benchmarks: Record<string, number>;

  @Column({ default: 0 })
  weight: number; // For weighted scoring

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
