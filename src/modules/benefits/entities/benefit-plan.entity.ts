import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum BenefitType {
  HEALTH_INSURANCE = 'health_insurance',
  DENTAL_INSURANCE = 'dental_insurance',
  VISION_INSURANCE = 'vision_insurance',
  LIFE_INSURANCE = 'life_insurance',
  RETIREMENT_401K = 'retirement_401k',
  PENSION = 'pension',
  DISABILITY = 'disability',
  WELLNESS = 'wellness',
  EDUCATION = 'education',
  TRANSPORTATION = 'transportation',
  OTHER = 'other',
}

export enum CoverageLevel {
  INDIVIDUAL = 'individual',
  FAMILY = 'family',
  SPOUSE = 'spouse',
  CHILDREN = 'children',
}

@Entity({ name: 'benefit_plans' })
export class BenefitPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: BenefitType })
  type: BenefitType;

  @Column({ type: 'varchar' })
  provider: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  employerContribution: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  employeeContribution: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCost: number | null;

  @Column({ type: 'jsonb', nullable: true })
  coverageLevels: {
    level: CoverageLevel;
    cost: number;
  }[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'date', nullable: true })
  enrollmentStartDate: Date | null;

  @Column({ type: 'date', nullable: true })
  enrollmentEndDate: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
