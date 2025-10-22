import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { KPI } from './kpi.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'kpi_records' })
@Index(['tenantId', 'kpiId', 'recordDate'])
@Index(['tenantId', 'employeeId'])
export class KPIRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  kpiId: string;

  @ManyToOne(() => KPI)
  @JoinColumn({ name: 'kpiId' })
  kpi: KPI;

  @Column({ type: 'uuid', nullable: true })
  employeeId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'employeeId' })
  employee: User | null;

  @Column({ type: 'uuid', nullable: true })
  departmentId: string | null;

  @Column({ type: 'date' })
  recordDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  actualValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  targetValue: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  achievementRate: number | null; // Percentage

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'uuid', nullable: true })
  recordedBy: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
