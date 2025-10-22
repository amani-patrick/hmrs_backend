import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Assessment } from './assessment.entity';

export enum ResultStatus {
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  PASSED = 'passed',
  FAILED = 'failed',
}

@Entity({ name: 'assessment_results' })
export class AssessmentResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar' })
  assessmentId: string;

  @ManyToOne(() => Assessment)
  @JoinColumn({ name: 'assessmentId' })
  assessment: Assessment;

  @Column({ type: 'varchar' })
  learnerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'learnerId' })
  learner: User;

  @Column({ default: 1 })
  attemptNumber: number;

  @Column({ type: 'enum', enum: ResultStatus, default: ResultStatus.IN_PROGRESS })
  status: ResultStatus;

  @Column({ type: 'jsonb' })
  answers: Record<string, any>;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  score: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  percentage: number;

  @Column({ default: false })
  isPassed: boolean;

  @Column({ type: 'int', nullable: true })
  timeSpent: number; // In minutes

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  gradedAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  gradedBy: string | null;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
