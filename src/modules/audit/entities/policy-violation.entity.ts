import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ViolationType {
  ATTENDANCE = 'attendance',
  CODE_OF_CONDUCT = 'code_of_conduct',
  DATA_SECURITY = 'data_security',
  HARASSMENT = 'harassment',
  SAFETY = 'safety',
  FINANCIAL = 'financial',
  CONFLICT_OF_INTEREST = 'conflict_of_interest',
  OTHER = 'other',
}

export enum ViolationSeverity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  MAJOR = 'major',
  SEVERE = 'severe',
}

export enum ViolationStatus {
  REPORTED = 'reported',
  INVESTIGATING = 'investigating',
  CONFIRMED = 'confirmed',
  DISMISSED = 'dismissed',
  RESOLVED = 'resolved',
}

@Entity({ name: 'policy_violations' })
@Index(['tenantId', 'employeeId'])
@Index(['tenantId', 'status'])
export class PolicyViolation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  employeeId: string;

  @Column({ nullable: true })
  reportedBy: string | null;

  @Column({ type: 'enum', enum: ViolationType })
  violationType: ViolationType;

  @Column({ type: 'enum', enum: ViolationSeverity })
  severity: ViolationSeverity;

  @Column({ type: 'enum', enum: ViolationStatus, default: ViolationStatus.REPORTED })
  status: ViolationStatus;

  @Column({ type: 'date' })
  incidentDate: Date;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  policyReference: string | null;

  @Column({ type: 'text', nullable: true })
  investigation: string | null;

  @Column({ type: 'text', nullable: true })
  action: string | null;

  @Column({ nullable: true })
  investigatorId: string | null;

  @Column({ default: false })
  isConfidential: boolean;

  @Column({ type: 'jsonb', nullable: true })
  evidence: Array<{
    type: string;
    url?: string;
    description: string;
  }>;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
