import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ComplianceType {
  GDPR = 'gdpr',
  HIPAA = 'hipaa',
  SOX = 'sox',
  ISO_27001 = 'iso_27001',
  LABOR_LAW = 'labor_law',
  SAFETY = 'safety',
  CUSTOM = 'custom',
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PARTIAL = 'partial',
  UNDER_REVIEW = 'under_review',
  PENDING = 'pending',
}

@Entity({ name: 'compliance_reports' })
@Index(['tenantId', 'complianceType'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'reportDate'])
export class ComplianceReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: ComplianceType })
  complianceType: ComplianceType;

  @Column({ type: 'enum', enum: ComplianceStatus })
  status: ComplianceStatus;

  @Column({ type: 'date' })
  reportDate: Date;

  @Column({ type: 'date', nullable: true })
  nextReviewDate: Date | null;

  @Column({ type: 'varchar', nullable: true })
  departmentId: string | null;

  @Column({ type: 'varchar', nullable: true })
  responsiblePersonId: string | null;

  @Column({ type: 'jsonb' })
  findings: Array<{
    id: string;
    category: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved';
    remediation?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metrics: Record<string, number>;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  complianceScore: number | null; // 0-100

  @Column({ type: 'text', nullable: true })
  recommendations: string | null;

  @Column({ type: 'jsonb', nullable: true })
  documents: Array<{
    name: string;
    url: string;
    type: string;
  }>;

  @Column({ type: 'varchar', nullable: true })
  auditorId: string | null;

  @Column({ type: 'varchar', nullable: true })
  auditorName: string | null;

  @Column({ default: false })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
