import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Candidate } from './candidate.entity';
import { User } from '../../users/entities/user.entity';

export enum InterviewStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled'
}

export enum InterviewType {
  PHONE_SCREEN = 'phone_screen',
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  PANEL = 'panel',
  FINAL = 'final'
}

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp with time zone' })
  scheduledAt: Date;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ 
    type: 'enum',
    enum: InterviewStatus,
    default: InterviewStatus.SCHEDULED
  })
  status: InterviewStatus;

  @Column({ 
    type: 'enum',
    enum: InterviewType,
    default: InterviewType.TECHNICAL
  })
  type: InterviewType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  meetingUrl: string;

  @Column({ type: 'integer', default: 60 })
  durationMinutes: number;

  @Column({ type: 'jsonb', nullable: true })
  feedback: {
    rating?: number;
    notes?: string;
    strengths?: string[];
    areasForImprovement?: string[];
    recommendedNextSteps?: string[];
  };

  @Column({ type: 'uuid' })
  candidateId: string;

  @ManyToOne(() => Candidate, candidate => candidate.interviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidateId' })
  candidate: Candidate;

  @Column({ type: 'uuid', nullable: true })
  interviewerId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'interviewerId' })
  interviewer: User;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
}
