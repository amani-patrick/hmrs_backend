import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum EnrollmentStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Entity({ name: 'benefit_enrollments' })
@Index(['tenantId', 'employeeId', 'benefitPlanId'])
export class BenefitEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  employeeId: string;

  @Column()
  benefitPlanId: string;

  @Column({ type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.PENDING })
  status: EnrollmentStatus;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ nullable: true })
  coverageLevel: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  employeeContribution: number | null;

  @Column({ type: 'jsonb', nullable: true })
  dependents: {
    name: string;
    relationship: string;
    dateOfBirth: string;
  }[];

  @Column({ nullable: true })
  approvedBy: string | null;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
