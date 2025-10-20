import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum FeedbackType {
  POSITIVE = 'positive',
  CONSTRUCTIVE = 'constructive',
  GENERAL = 'general',
  PEER = 'peer',
  UPWARD = 'upward',
  DOWNWARD = 'downward',
}

export enum FeedbackStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  ACKNOWLEDGED = 'acknowledged',
  ARCHIVED = 'archived',
}

@Entity({ name: 'feedback' })
@Index(['tenantId', 'recipientId'])
@Index(['tenantId', 'giverId'])
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  recipientId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipientId' })
  recipient: User;

  @Column()
  giverId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'giverId' })
  giver: User;

  @Column({ type: 'enum', enum: FeedbackType })
  type: FeedbackType;

  @Column({ type: 'enum', enum: FeedbackStatus, default: FeedbackStatus.DRAFT })
  status: FeedbackStatus;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  ratings: Array<{
    category: string;
    rating: number; // 1-5
  }>;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ nullable: true })
  projectId: string | null;

  @Column({ nullable: true })
  reviewId: string | null;

  @Column({ default: false })
  isAnonymous: boolean;

  @Column({ default: false })
  isPrivate: boolean;

  @Column({ default: false })
  isAcknowledged: boolean;

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
