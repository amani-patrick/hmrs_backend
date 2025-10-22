import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum RiskCategory {
  OPERATIONAL = 'operational',
  FINANCIAL = 'financial',
  COMPLIANCE = 'compliance',
  STRATEGIC = 'strategic',
  REPUTATIONAL = 'reputational',
  SECURITY = 'security',
  HR = 'hr',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum RiskStatus {
  IDENTIFIED = 'identified',
  ASSESSING = 'assessing',
  MITIGATING = 'mitigating',
  MONITORING = 'monitoring',
  CLOSED = 'closed',
}

@Entity({ name: 'risk_assessments' })
@Index(['tenantId', 'riskLevel'])
@Index(['tenantId', 'status'])
export class RiskAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: RiskCategory })
  category: RiskCategory;

  @Column({ type: 'enum', enum: RiskLevel })
  riskLevel: RiskLevel;

  @Column({ type: 'enum', enum: RiskStatus, default: RiskStatus.IDENTIFIED })
  status: RiskStatus;

  @Column({ type: 'int', default: 1 })
  likelihood: number; // 1-5 scale

  @Column({ type: 'int', default: 1 })
  impact: number; // 1-5 scale

  @Column({ type: 'int', default: 1 })
  riskScore: number; // likelihood * impact

  @Column({ type: 'text', nullable: true })
  potentialImpact: string | null;

  @Column({ type: 'text', nullable: true })
  currentControls: string | null;

  @Column({ type: 'jsonb' })
  mitigationActions: Array<{
    id: string;
    action: string;
    responsiblePersonId?: string;
    dueDate?: string;
    status: 'pending' | 'in_progress' | 'completed';
    completedAt?: string;
  }>;

  @Column({ type: 'uuid', nullable: true })
  ownerId: string | null;

  @Column({ type: 'uuid', nullable: true })
  departmentId: string | null;

  @Column({ type: 'date', nullable: true })
  identifiedDate: Date | null;

  @Column({ type: 'date', nullable: true })
  nextReviewDate: Date | null;

  @Column({ type: 'int', nullable: true })
  residualLikelihood: number | null; // After mitigation

  @Column({ type: 'int', nullable: true })
  residualImpact: number | null;

  @Column({ type: 'int', nullable: true })
  residualRiskScore: number | null;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
