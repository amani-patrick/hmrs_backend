import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ClaimStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
}

@Entity({ name: 'benefit_claims' })
export class BenefitClaim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  employeeId: string;

  @Column()
  enrollmentId: string;

  @Column()
  claimNumber: string;

  @Column({ type: 'date' })
  serviceDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  claimAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  approvedAmount: number | null;

  @Column({ type: 'enum', enum: ClaimStatus, default: ClaimStatus.SUBMITTED })
  status: ClaimStatus;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true })
  attachments: string[];

  @Column({ nullable: true })
  reviewedBy: string | null;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
