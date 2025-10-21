import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ReviewType {
  ANNUAL = 'annual',
  QUARTERLY = 'quarterly',
  PROBATION = 'probation',
  PROJECT = 'project',
  SELF_ASSESSMENT = 'self_assessment',
  PEER_REVIEW = 'peer_review',
  MANAGER_REVIEW = 'manager_review',
}

export enum ReviewStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum OverallRating {
  EXCEEDS_EXPECTATIONS = 'exceeds_expectations',
  MEETS_EXPECTATIONS = 'meets_expectations',
  NEEDS_IMPROVEMENT = 'needs_improvement',
  UNSATISFACTORY = 'unsatisfactory',
}

@Entity({ name: 'performance_reviews' })
@Index(['tenantId', 'employeeId'])
@Index(['tenantId', 'reviewerId'])
@Index(['tenantId', 'reviewPeriodStart'])
export class PerformanceReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  employeeId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'employeeId' })
  employee: User;

  @Column()
  reviewerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column({ type: 'enum', enum: ReviewType })
  reviewType: ReviewType;

  @Column({ type: 'enum', enum: ReviewStatus, default: ReviewStatus.DRAFT })
  status: ReviewStatus;

  @Column({ type: 'date' })
  reviewPeriodStart: Date;

  @Column({ type: 'date' })
  reviewPeriodEnd: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'enum', enum: OverallRating, nullable: true })
  overallRating: OverallRating | null;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  overallScore: number | null; // 0-5 scale

  @Column({ type: 'jsonb', nullable: true })
  competencies: Array<{
    name: string;
    category: string;
    rating: number;
    comments?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  goals: Array<{
    goalId?: string;
    title: string;
    achievement: number; // 0-100%
    comments?: string;
  }>;

  @Column({ type: 'text', nullable: true })
  strengths: string | null;

  @Column({ type: 'text', nullable: true })
  areasForImprovement: string | null;

  @Column({ type: 'text', nullable: true })
  achievements: string | null;

  @Column({ type: 'text', nullable: true })
  developmentPlan: string | null;

  @Column({ type: 'text', nullable: true })
  reviewerComments: string | null;

  @Column({ type: 'text', nullable: true })
  employeeComments: string | null;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ default: false })
  isAcknowledged: boolean;

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
