import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Course } from './course.entity';
import { TrainingProgram } from './training-program.entity';

export enum EnrollmentStatus {
  ENROLLED = 'enrolled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DROPPED = 'dropped',
  EXPIRED = 'expired',
}

@Entity({ name: 'enrollments' })
@Index(['tenantId', 'learnerId'])
@Index(['tenantId', 'courseId'])
@Index(['tenantId', 'programId'])
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  learnerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'learnerId' })
  learner: User;

  @Column({ nullable: true })
  courseId: string | null;

  @ManyToOne(() => Course, { nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: Course | null;

  @Column({ nullable: true })
  programId: string | null;

  @ManyToOne(() => TrainingProgram, { nullable: true })
  @JoinColumn({ name: 'programId' })
  program: TrainingProgram | null;

  @Column({ type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.ENROLLED })
  status: EnrollmentStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number; // 0-100

  @Column({ type: 'date' })
  enrolledDate: Date;

  @Column({ type: 'date', nullable: true })
  startedDate: Date | null;

  @Column({ type: 'date', nullable: true })
  completedDate: Date | null;

  @Column({ type: 'date', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number | null;

  @Column({ default: 0 })
  attempt: number;

  @Column({ nullable: true })
  timeSpent: number | null; // In minutes

  @Column({ type: 'jsonb', nullable: true })
  moduleProgress: Record<string, {
    completed: boolean;
    score?: number;
    completedAt?: string;
  }>;

  @Column({ default: false })
  isMandatory: boolean;

  @Column({ nullable: true })
  assignedBy: string | null;

  @Column({ nullable: true })
  certificateId: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
