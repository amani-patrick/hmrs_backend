import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ReportTemplate, ReportFormat } from './report-template.entity';

export enum ReportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

@Entity({ name: 'generated_reports' })
@Index(['tenantId', 'status'])
@Index(['tenantId', 'generatedBy'])
@Index(['tenantId', 'createdAt'])
export class GeneratedReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar' })
  templateId: string;

  @ManyToOne(() => ReportTemplate)
  @JoinColumn({ name: 'templateId' })
  template: ReportTemplate;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  @Column({ type: 'enum', enum: ReportFormat })
  format: ReportFormat;

  @Column({ type: 'jsonb', nullable: true })
  parameters: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  filters: {
    startDate?: string;
    endDate?: string;
    departmentId?: string;
    employeeId?: string;
    [key: string]: any;
  };

  @Column({ type: 'varchar', nullable: true })
  fileUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  fileName: string | null;

  @Column({ type: 'varchar', nullable: true })
  fileSize: string | null; // e.g., '2.4 MB'

  @Column({ type: 'int', nullable: true })
  recordCount: number | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ nullable: true })
  generatedBy: string;

  @Column({ type: 'varchar', nullable: true })
  generatedByName: string | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'date', nullable: true })
  expiresAt: Date | null; // Auto-delete after this date

  @Column({ default: 0 })
  downloadCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
