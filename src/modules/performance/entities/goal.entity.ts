import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum GoalType {
  INDIVIDUAL = 'individual',
  TEAM = 'team',
  ORGANIZATIONAL = 'organizational',
  DEVELOPMENT = 'development',
}

export enum GoalStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ON_TRACK = 'on_track',
  AT_RISK = 'at_risk',
  BEHIND = 'behind',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum GoalPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity({ name: 'goals' })
@Index(['tenantId', 'ownerId'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'dueDate'])
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  ownerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: GoalType })
  type: GoalType;

  @Column({ type: 'enum', enum: GoalStatus, default: GoalStatus.DRAFT })
  status: GoalStatus;

  @Column({ type: 'enum', enum: GoalPriority, default: GoalPriority.MEDIUM })
  priority: GoalPriority;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number; // 0-100

  @Column({ type: 'jsonb', nullable: true })
  keyResults: Array<{
    id: string;
    description: string;
    target: number;
    current: number;
    unit: string;
    isAchieved: boolean;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  milestones: Array<{
    id: string;
    title: string;
    dueDate: string;
    isCompleted: boolean;
    completedAt?: string;
  }>;

  @Column({ nullable: true })
  parentGoalId: string | null;

  @Column({ nullable: true })
  alignedGoalId: string | null; // For cascading goals

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ default: 0 })
  weight: number; // For weighted scoring

  @Column({ nullable: true })
  reviewId: string | null; // Link to performance review

  @Column({ default: false })
  isPrivate: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string | null;

  @Column({ nullable: true })
  completedAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
